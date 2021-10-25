pub mod arrow;
pub mod cdata;
pub mod csv;
// pub mod example;
pub mod extension;
pub mod metadata;
pub mod parquet;

use arrow2::{
    array::{Array, PrimitiveArray},
    buffer::{Buffer, MutableBuffer},
    compute::{
        arithmetics::*,
        arity::{binary, unary},
    },
    datatypes::{DataType, PhysicalType, PrimitiveType},
    error::ArrowError,
    types::NativeType,
};

fn buffers_and_bitmaps() {
    let x = Buffer::from(&[1u32, 2, 3]);
    assert_eq!(x.as_slice(), &[1u32, 2, 3]);

    let x = x.slice(1, 2);
    assert_eq!(x.as_slice(), &[2, 3]);

    // MutableBuffer<i64>
    let mut x: MutableBuffer<i64> = (0..3).collect();
    x[1] = 5;
    x.push(10);
    assert_eq!(x.as_slice(), &[0, 5, 2, 10]);

    // from another iterator
    let x = (0..1000).collect::<Vec<_>>();
    let y = MutableBuffer::from_trusted_len_iter(x.iter().map(|x| x * 2));
    assert_eq!(y[50], 100);

    // bitmaps for booleans
    use arrow2::bitmap::Bitmap;
    let x = Bitmap::from(&[true, false]);
    let iter = x.iter().map(|x| !x);
    let y = Bitmap::from_trusted_len_iter(iter);
    assert!(!y.get_bit(0));
    assert!(y.get_bit(1));
    // and the mutable version
    use arrow2::bitmap::MutableBitmap;
    let mut x = MutableBitmap::new();
    x.push(true);
    x.push(false);
    assert!(!x.get(1));
    x.set(1, x.get(0));
    assert!(x.get(1));
}

fn arrays() {
    let array1 = PrimitiveArray::<i32>::from([Some(1), None, Some(123)]);
    let array2 = PrimitiveArray::<f32>::from_slice([1.0, 0.0, 123.0]);
    // let array3: PrimitiveArray<u64> = [Some(1), None,
    // Some(123)].iter().collect();
    assert_eq!(array1.len(), array2.len());
}

// Array as a trait obect
#[warn(dead_code)]
pub fn float_operator(array: &dyn Array) -> Result<Box<dyn Array>, String> {
    match array.data_type().to_physical_type() {
        PhysicalType::Primitive(PrimitiveType::Float32) => {
            let array = array
                .as_any()
                .downcast_ref::<PrimitiveArray<f32>>()
                .unwrap();
            let array = array.clone();
            Ok(Box::new(array))
        },
        PhysicalType::Primitive(PrimitiveType::Float64) => {
            let array = array
                .as_any()
                .downcast_ref::<PrimitiveArray<f32>>()
                .unwrap();
            let array = array.clone();
            Ok(Box::new(array))
        },
        _ => Err("Only for float point arrays".to_string()),
    }
}

// vectorized SIMD instructions
pub fn funary<I, F, O>(
    array: &PrimitiveArray<I>,
    op: F,
    data_type: &DataType,
) -> PrimitiveArray<O>
where
    I: NativeType,
    O: NativeType,
    F: Fn(I) -> O,
{
    // create iterator over values
    let values = array.values().iter().map(|v| op(*v));
    let values = Buffer::from_trusted_len_iter(values);

    // create and clone validity
    // from_trusted_len_iter could be faster if op is expensive
    PrimitiveArray::<O>::from_data(
        data_type.clone(),
        values,
        array.validity().cloned(),
    )
}

fn main() -> Result<(), ArrowError> {
    buffers_and_bitmaps();
    arrays();

    // 1. two arrays
    let array1 = PrimitiveArray::<i64>::from(&[Some(1), Some(2), Some(3)]);
    let array2 = PrimitiveArray::<i64>::from(&[Some(4), None, Some(6)]);

    // 2. add them!
    assert_eq!(
        arithmetic_primitive(&array1, Operator::Add, &array2)?,
        PrimitiveArray::<i64>::from(&[Some(5), None, Some(9)])
    );

    // 3. array trait object
    let array1_trait = &array1 as &dyn Array;
    let array2_trait = &array2 as &dyn Array;
    assert!(can_arithmetic(
        array1_trait.data_type(),
        Operator::Add,
        array2_trait.data_type()
    ));
    assert_eq!(
        PrimitiveArray::<i64>::from(&[Some(5), None, Some(9)]),
        arithmetic(array1_trait, Operator::Add, array2_trait)
            .unwrap()
            .as_ref()
    );

    // 4. arbitrary binary operation
    let op = |x: i64, y: i64| x.pow(2) + y.pow(2);
    assert_eq!(
        binary(&array1, &array2, DataType::Int64, op)?,
        PrimitiveArray::<i64>::from(&[Some(1 + 16), None, Some(9 + 36)])
    );

    // 5. arbitrary unary operations
    let array_unary =
        PrimitiveArray::<f64>::from(&[Some(4.0), None, Some(6.0)]);
    let result = unary(
        &array_unary,
        |x| x.cos().powi(2) + x.sin().powi(2),
        DataType::Float64,
    );
    assert!((result.values()[0] - 1.0).abs() < 0.0001);
    assert!(result.is_null(1));
    assert!((result.values()[2] - 1.0).abs() < 0.0001);

    // 6. type transformation
    let arr = PrimitiveArray::<f64>::from(&[Some(4.4), None, Some(4.6)]);
    assert_eq!(
        unary(&arr, |x| x.round() as i64, DataType::Int64),
        PrimitiveArray::<i64>::from(&[Some(4), None, Some(5)])
    );

    Ok(())
}
