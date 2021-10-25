// INTENSIVE TASKS
// 1. split into rows (seeking, parsing)
// 2. parse set of rows into RecordBatch
// * use multiple readers that scan different file parts
// * because bytes -> values is harder than line interpretation
// parsing can be run on separate thread!

use std::{
    sync::{
        mpsc::{channel, Receiver, Sender},
        Arc,
    },
    thread::{spawn, JoinHandle},
    time::SystemTime,
};

use arrow2::{
    array::{Array, PrimitiveArray},
    datatypes::{Field, Schema},
    error::Result,
    io::csv::{read, write},
    record_batch::RecordBatch,
};
use crossbeam_channel::unbounded;

fn sync_read(
    path: &str,
    projection: Option<&[usize]>,
) -> Result<RecordBatch> {
    // 1. CSV reader on file-reading thread
    let mut reader = read::ReaderBuilder::new().from_path(path)?;

    // 2. infer schema (string -> DataType)
    let schema = read::infer_schema(&mut reader, None, true, &read::infer)?;

    // 3. allocate space for reading from CSV (length is # rows)
    let mut rows = vec![read::ByteRecord::default(); 100];

    // 4. read rows (IO-intensive, NO CPU, No SerDe)
    let rows_read = read::read_rows(&mut reader, 0, &mut rows)?;
    let rows = &rows[..rows_read];

    // 5. parse into RecordBatch (NO IO, ALL CPU)
    // can be on different thread if rows passed through channel
    read::deserialize_batch(
        rows,
        schema.fields(),
        projection,
        0,
        read::deserialize_column,
    )
}

fn sync_write_batch(
    path: &str,
    batches: &[RecordBatch],
) -> Result<()> {
    let mut writer = write::WriterBuilder::new().from_path(path)?;

    write::write_header(&mut writer, batches[0].schema())?;

    let options = write::SerializeOptions::default();
    batches
        .iter()
        .try_for_each(|batch| write::write_batch(&mut writer, batch, &options))
}

fn concurrent_read(path: &str) -> Result<Vec<RecordBatch>> {
    let batch_size = 100;
    let has_header = true;
    let projection: Option<&[usize]> = None;

    // 1. prep channel to funnel threads to serialized records
    let (sender, receiver) = unbounded();

    // 2. define reader and schema
    let mut reader = read::ReaderBuilder::new().from_path(path)?;
    let schema = read::infer_schema(
        &mut reader,
        Some(batch_size * 100),
        has_header,
        &read::infer,
    )?;
    let schema = Arc::new(schema);

    // 3. spawn IO-bounded thread to produce `Vec<ByteRecords>`
    let start = SystemTime::now();
    let thread = spawn(move || {
        let mut line_num = 0;
        let mut size = 1;
        while size > 0 {
            let mut rows = vec![read::ByteRecord::default(); batch_size];
            let rows_read = read::read_rows(&mut reader, 0, &mut rows).unwrap();
            rows.truncate(rows_read);

            line_num += rows.len();
            size = rows.len();

            sender.send((rows, line_num)).unwrap();
        }
    });

    // 4. decompress, decode, deserialize (we use 3 consumers)
    let mut children = Vec::<JoinHandle<RecordBatch>>::new();
    for _ in 0..3 {
        let consumer = receiver.clone();
        let consumer_schema = schema.clone();
        let child = spawn(move || {
            let (rows, line_num) = consumer.recv().unwrap();
            let start = SystemTime::now();
            println!("Consumer start - {}", line_num);
            let batch = read::deserialize_batch(
                &rows,
                consumer_schema.fields(),
                projection,
                0,
                read::deserialize_column,
            )
            .unwrap();
            println!(
                "Consumer end - {:?}: {}",
                start.elapsed().unwrap(),
                line_num
            );
            batch
        });
        children.push(child);
    }

    // 5. collect threads
    thread.join().expect("Child thread panicked!");
    let batches = children
        .into_iter()
        .map(|x| x.join().unwrap())
        .collect::<Vec<_>>();
    println!("Finished - {:?}", start.elapsed().unwrap());

    Ok(batches)
}

fn concurrent_write_batch(
    path: &str,
    batches: [RecordBatch; 2],
) -> Result<()> {
    let mut writer = write::WriterBuilder::new().from_path(path)?;
    write::write_header(&mut writer, batches[0].schema())?;

    // prepare message channel & CSV serializer options + initialize children
    let (sender, receiver): (Sender<_>, Receiver<_>) = channel();
    let mut children = Vec::new();
    let options = write::SerializeOptions::default();

    (0..batches.len()).for_each(|idx| {
        let sender_thread = sender.clone();
        let options = options.clone();
        let batch = batches[idx].clone();
        let child = spawn(move || {
            let records = write::serialize(&batch, &options).unwrap();
            sender_thread.send(records).unwrap();
        });
        children.push(child);
    });

    for _ in 0..batches.len() {
        let records = receiver.recv().unwrap();
        records
            .iter()
            .try_for_each(|record| writer.write_byte_record(record))?;
    }

    // rejoin
    for child in children {
        child.join().expect("child thread panicked!");
    }

    Ok(())
}

// fn write(
//     path: &str,
//     array: &dyn Array,
//     is_sync: bool
// ) -> Result<()> {

//     if is_sync {
//         sync_write_batch(path, &[batch])
//     } else {
//         concurrent_write_batch(path, [batch.clone(), batch])
//     }
// }

pub fn main() -> Result<()> {
    use std::env;
    let args: Vec<String> = env::args().collect();
    let file_path = &args[1];
    let array = args[2..]
        .iter()
        .map(|x| x.parse::<i32>().ok())
        .collect::<PrimitiveArray<_>>();

    // WRITE
    let field = Field::new("field", array.data_type().clone(), true);
    let schema = Schema::new(vec![field]);
    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(array)])?;
    sync_write_batch(file_path, &[batch.clone()])?;
    concurrent_write_batch(file_path, [batch.clone(), batch])?;

    // synchronous
    let batch = sync_read(file_path, None)?;
    println!("{:?}", batch);

    // multithreading / concurrency
    let batches = concurrent_read(file_path)?;
    for batch in batches {
        println!("{}", batch.num_rows());
    }

    Ok(())
}
