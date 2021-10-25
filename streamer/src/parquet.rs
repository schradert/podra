// 1. page is like a slice of an Array (part of column)
// 2. column chunk is like an Array (multiple pages)
// 3. row group is like a RecordBatch (group of columns of same length)

use std::{
    env,
    fs::File,
    iter::once,
    sync::Arc,
    thread::spawn,
    time::SystemTime,
};

use arrow2::{
    array::{Array, Int32Array, Utf8Array},
    datatypes::{Field, PhysicalType, Schema},
    error::Result,
    io::parquet::{read, write},
    record_batch::RecordBatch,
};
use crossbeam_channel::unbounded;
use rayon::prelude::*;

fn read_column_chunk(
    path: &str,
    row_group: usize,
    column: usize,
) -> Result<Box<dyn Array>> {
    // 1. open file & read metadata (file + columns) (small IO) into schema
    let mut file = File::open(path)?;
    let file_metadata = read::read_metadata(&mut file)?;
    let metadata = file_metadata.row_groups[row_group].column(column);
    let arrow_schema = read::get_schema(&file_metadata)?;

    // 2. build iterator over pages (bind file to read compressed page into
    // memory) (high IO)
    let data_type = arrow_schema.fields()[column].data_type().clone();
    let pages = read::get_page_iterator(metadata, &mut file, None, vec![])?;

    // 3. decompress + decode + deserialize into Arrow (+ deallocated)
    // uses internal buffer for decompression
    let mut pages = read::Decompressor::new(pages, vec![]);
    read::page_iter_to_array(&mut pages, metadata, data_type)
}

// CPU-intensive tasks on separate threads, single thread IO-intensive
fn concurrent_read(path: &str) -> Result<Vec<Box<dyn Array>>> {
    let (sender, receiver) = unbounded();

    // 1. Open file and read metadata and schema
    let mut file = File::open(path)?;
    let file_metadata = read::read_metadata(&mut file)?;
    let schema = Arc::new(read::get_schema(&file_metadata)?);
    let file_metadata = Arc::new(file_metadata);

    // 2. Produce by collecting each page iterator in metadata (+ send msg)
    let start = SystemTime::now();
    let producer_metadata = file_metadata.clone();
    let child = spawn(move || {
        for col_num in 0..producer_metadata.schema().num_columns() {
            for row_group_num in 0..producer_metadata.row_groups.len() {
                let start = SystemTime::now();
                let column_metadata =
                    producer_metadata.row_groups[row_group_num].column(col_num);
                println!("produce start: {} {}", col_num, row_group_num);
                let pages = read::get_page_iterator(
                    column_metadata,
                    &mut file,
                    None,
                    vec![],
                )
                .unwrap()
                .collect::<Vec<_>>();
                println!(
                    "produce end - {:?}: {} {}",
                    start.elapsed().unwrap(),
                    col_num,
                    row_group_num
                );
                sender.send((col_num, row_group_num, pages)).unwrap();
            }
        }
    });

    // 3. Use multiple consumers to decompress, decode, deserialize, deallocate
    let mut children = Vec::new();
    for _ in 0..3 {
        let receiver_consumer = receiver.clone();
        let metadata_consumer = file_metadata.clone();
        let schema_consumer = schema.clone();
        let child = spawn(move || {
            let (col_num, row_group_num, iter) =
                receiver_consumer.recv().unwrap();
            let start = SystemTime::now();
            println!("consumer start: {} {}", col_num, row_group_num);
            let metadata =
                metadata_consumer.row_groups[row_group_num].column(col_num);
            let data_type =
                schema_consumer.fields()[col_num].data_type().clone();
            let pages = iter
                .into_iter()
                .map(|x| x.and_then(|x| read::decompress(x, &mut vec![])));
            let mut pages = read::streaming_iterator::convert(pages);
            let array =
                read::page_iter_to_array(&mut pages, metadata, data_type);
            println!(
                "Finished - {:?}: {} {}",
                start.elapsed().unwrap(),
                col_num,
                row_group_num
            );

            array
        });
        children.push(child);
    }

    child.join().expect("child thread panicked");

    let arrays = children
        .into_iter()
        .map(|x| x.join().unwrap())
        .collect::<Result<Vec<_>>>()?;
    println!("Finished - {:?}", start.elapsed().unwrap());

    Ok(arrays)
}

fn write_array_single_thread(
    path: &str,
    array: &dyn Array,
    field: Field,
) -> Result<()> {
    let schema = Schema::new(vec![field]);
    let schema_parquet = write::to_parquet_schema(&schema)?;
    let options = write::WriteOptions {
        write_statistics: true,
        compression:      write::Compression::Uncompressed,
        version:          write::Version::V2,
    };
    let encoding = write::Encoding::Plain;

    // define iterator of `row_groups` of `column_chunks` of `pages`
    // `column_chunks` in `row_group` must have same length!
    #[rustfmt::skip]
    let row_groups = 
        once(Result::Ok(write::DynIter::new(
            once(Result::Ok(write::DynIter::new(
                once(array)
                    .zip(schema_parquet.columns().to_vec().into_iter())
                    .map(|(array, descriptor)| {
                        write::array_to_page(array, descriptor, options, encoding)
                    }),
        ),
    )))));

    // write to file (errors result in corruption!)
    let mut file = File::create(path)?;
    let _ = write::write_file(
        &mut file,
        row_groups,
        &schema,
        schema_parquet,
        options,
        None,
    );

    Ok(())
}

// writes batch to row group (single page per column)
fn write_batch_single_thread_single_page(
    path: &str,
    batch: RecordBatch,
) -> Result<()> {
    let schema = batch.schema().clone();
    let options = write::WriteOptions {
        write_statistics: true,
        compression:      write::Compression::Uncompressed,
        version:          write::Version::V2,
    };

    let iter = vec![Ok(batch)];
    let row_groups = write::RowGroupIterator::try_new(
        iter.into_iter(),
        &schema,
        options,
        vec![write::Encoding::Plain],
    )?;

    let mut file = File::create(path)?;
    let schema_parquet = row_groups.parquet_schema().clone();
    let _ = write::write_file(
        &mut file,
        row_groups,
        &schema,
        schema_parquet,
        options,
        None,
    )?;

    Ok(())
}

fn parallel_write_rayon(
    path: &str,
    batch: &RecordBatch,
) -> Result<()> {
    let options = write::WriteOptions {
        write_statistics: true,
        compression:      write::Compression::Snappy,
        version:          write::Version::V2,
    };
    let schema_parquet = write::to_parquet_schema(batch.schema())?;

    // define encodings for fields
    let encodings = batch.schema().fields().par_iter().map(|field| match field
        .data_type()
        .to_physical_type()
    {
        PhysicalType::Binary
        | PhysicalType::LargeBinary
        | PhysicalType::Utf8
        | PhysicalType::LargeUtf8 => write::Encoding::DeltaLengthByteArray,
        _ => write::Encoding::Plain,
    });

    // write batch to pages (rayon parallelized)
    let columns = batch
        .columns()
        .par_iter()
        .zip(schema_parquet.columns().to_vec().into_par_iter())
        .zip(encodings)
        .map(|((array, descriptor), encoding)| {
            let array = array.clone();
            Ok(write::array_to_pages(array, descriptor, options, encoding)?
                .collect::<Vec<_>>())
        })
        .collect::<Result<Vec<_>>>()?;

    let row_groups = once(Result::Ok(write::DynIter::new(
        columns
            .into_iter()
            .map(|column| Ok(write::DynIter::new(column.into_iter()))),
    )));

    let mut file = File::create(path)?;
    let _ = write::write_file(
        &mut file,
        row_groups,
        batch.schema(),
        schema_parquet,
        options,
        None,
    )?;

    Ok(())
}

fn create_batch(size: usize) -> Result<RecordBatch> {
    let field1 = (0..size)
        .map(|x| if x % 9 == 0 { None } else { Some(x as i32) })
        .collect::<Int32Array>();
    let field2 = (0..size)
        .map(|x| {
            if x % 8 == 0 {
                None
            } else {
                Some(x.to_string())
            }
        })
        .collect::<Utf8Array<i32>>();

    RecordBatch::try_from_iter([
        ("field1", Arc::new(field1) as Arc<dyn Array>),
        ("field2", Arc::new(field2) as Arc<dyn Array>),
    ])
}

pub fn main() -> Result<()> {
    let args: Vec<String> = env::args().collect();
    let path = &args[1];
    let column = args[2].parse::<usize>().unwrap();
    let row_group = args[3].parse::<usize>().unwrap();

    let array = read_column_chunk(path, row_group, column)?;
    println!("{:?}", array);

    for array in concurrent_read(path)? {
        println!("{}", array);
    }

    let array = Int32Array::from(&[Some(0), None, Some(2)]);
    let field = Field::new("field", array.data_type().clone(), true);
    write_array_single_thread("test.parquet", &array, field.clone())?;

    let schema = Schema::new(vec![field]);
    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(array)])?;
    write_batch_single_thread_single_page("test2.parquet", batch)?;

    let batch = create_batch(10_000_000)?;
    parallel_write_rayon("parallel.parquet", &batch)?;

    Ok(())
}
