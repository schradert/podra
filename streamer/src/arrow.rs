use std::{
    env,
    fs::File,
    net::TcpStream,
    sync::Arc,
    thread::sleep,
    time::Duration,
};

use arrow2::{
    array::{Int32Array, Utf8Array},
    datatypes::{DataType, Field, Schema},
    error::Result,
    io::{
        ipc::{read, write},
        print,
    },
    record_batch::RecordBatch,
};

fn read_batches(path: &str) -> Result<Vec<RecordBatch>> {
    let mut file = File::open(path)?;
    let metadata = read::read_file_metadata(&mut file)?;
    let reader = read::FileReader::new(&mut file, metadata, None);

    reader.collect()
}

fn write_batches(
    path: &str,
    schema: &Schema,
    batches: &[RecordBatch],
) -> Result<()> {
    let file = File::create(path)?;
    let mut writer = write::FileWriter::try_new(file, schema)?;

    for batch in batches {
        writer.write(batch)?;
    }

    writer.finish()
}

fn read_stream() -> Result<()> {
    const ADDRESS: &str = "127.0.0.1:12989";

    let mut reader = TcpStream::connect(ADDRESS)?;
    let metadata = read::read_stream_metadata(&mut reader)?;
    let stream = read::StreamReader::new(&mut reader, metadata);

    let mut idx = 0;
    for x in stream {
        match x {
            Ok(read::StreamState::Some(batch)) => {
                idx += 1;
                println!("batch: {:?}", batch);
            },
            Ok(read::StreamState::Waiting) => {
                sleep(Duration::from_millis(2000))
            },
            Err(e) => println!("{:?} ({})", e, idx),
        }
    }

    Ok(())
}

pub fn main() -> Result<()> {
    let args = env::args().collect::<Vec<_>>();
    let path = &args[1];

    // write
    let schema = Schema::new(vec![
        Field::new("field1", DataType::Int32, false),
        Field::new("field2", DataType::Utf8, false),
    ]);
    let arr1 = Int32Array::from_slice(&[1, 2, 3, 4, 5]);
    let arr2 = Utf8Array::<i32>::from_slice(&["a", "b", "c", "d", "e"]);
    let batch = RecordBatch::try_new(Arc::new(schema.clone()), vec![
        Arc::new(arr1),
        Arc::new(arr2),
    ])?;
    write_batches(path, &schema, &[batch])?;

    // read
    let batches = read_batches(path)?;
    print::print(&batches);
    read_stream()?;
    Ok(())
}
