use std::sync::Arc;

use arrow2::{
    array::*,
    compute::arithmetics,
    error::Result,
    io::parquet::write::*,
    record_batch::RecordBatch,
};

pub fn main() -> Result<()> {
    // 1. declare
    let arr1 = Int32Array::from(&[Some(1), None, Some(3)]);
    let arr2 = Int32Array::from(&[Some(2), None, Some(6)]);
    assert_eq!(arr1.len(), arr2.len());

    // 2. compute
    assert_eq!(arithmetics::basic::mul_scalar(&arr1, &2), arr2);

    // 3. declare records
    let batch = RecordBatch::try_from_iter([
        ("c1", Arc::new(arr1) as Arc<dyn Array>),
        ("c2", Arc::new(arr2) as Arc<dyn Array>),
    ])
    .unwrap();
    println!("{:?}", batch.schema());

    // 4. write records to Parquet file
    let schema = batch.schema().clone();
    let options = WriteOptions {
        write_statistics: true,
        compression:      Compression::Snappy,
        version:          Version::V1,
    };
    let row_groups = RowGroupIterator::try_new(
        vec![Ok(batch)].into_iter(),
        &schema,
        options,
        vec![Encoding::Plain, Encoding::Plain],
    )
    .unwrap();
    let parquet_schema = row_groups.parquet_schema().clone();
    let mut file = vec![];
    let file_write = write_file(
        &mut file,
        row_groups,
        &schema,
        parquet_schema,
        options,
        None,
    );

    match file_write {
        Ok(_) => Ok(()),
        Err(e) => Err(e),
    }
}
