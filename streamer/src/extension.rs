use std::{
    io::{Cursor, Seek, Write},
    sync::Arc,
};

use arrow2::{
    array::{Array, UInt16Array},
    datatypes::{DataType, Field, Schema},
    error::Result,
    io::ipc::{read, write},
    record_batch::RecordBatch,
};

fn write_ipc<W: Write + Seek>(
    writer: W,
    array: impl Array + 'static,
) -> Result<W> {
    // schema with a field of array data type
    let schema = Schema::new(vec![Field::new(
        "field",
        array.data_type().clone(),
        false,
    )]);
    let mut writer = write::FileWriter::try_new(writer, &schema)?;
    let batch = RecordBatch::try_new(Arc::new(schema), vec![Arc::new(array)])?;

    writer.write(&batch)?;

    Ok(writer.into_inner())
}

fn read_ipc(reader: &[u8]) -> Result<RecordBatch> {
    let mut reader = Cursor::new(reader);
    let metadata = read::read_file_metadata(&mut reader)?;
    let mut reader = read::FileReader::new(&mut reader, metadata, None);
    reader.next().unwrap()
}

pub fn main() -> Result<()> {
    // declare custom type
    let ext_type = DataType::Extension(
        "date16".to_string(),
        Box::new(DataType::UInt16),
        None,
    );

    // init array with custom type
    let array = UInt16Array::from_slice([1, 2]).to(ext_type.clone());

    // same standard workflow
    let buffer = Cursor::new(vec![]);
    let res_buffer = write_ipc(buffer, array)?;

    // verify datatype is preserved
    let batch = read_ipc(&res_buffer.into_inner())?;
    let new_array = &batch.columns()[0];
    assert_eq!(new_array.data_type(), &ext_type);

    Ok(())
}
