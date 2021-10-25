use std::sync::Arc;

use arrow2::{
    array::{Array, PrimitiveArray},
    datatypes::Field,
    error::Result,
    ffi::{
        export_array_to_c,
        export_field_to_c,
        import_array_from_c,
        import_field_from_c,
        Ffi_ArrowArray,
        Ffi_ArrowSchema,
    },
};

unsafe fn export(
    array: Arc<dyn Array>,
    array_ptr: *mut Ffi_ArrowArray,
    schema_ptr: *mut Ffi_ArrowSchema,
) {
    let field = Field::new("field", array.data_type().clone(), true);
    export_array_to_c(array, array_ptr);
    export_field_to_c(&field, schema_ptr);
}

unsafe fn import(
    array: Box<Ffi_ArrowArray>,
    schema: &Ffi_ArrowSchema,
) -> Result<Box<dyn Array>> {
    let field = import_field_from_c(schema)?;
    import_array_from_c(array, &field)
}

pub fn main() -> Result<()> {
    let array =
        Arc::new(PrimitiveArray::<i32>::from([Some(1), None, Some(123)]))
            as Arc<dyn Array>;

    // initialize structs to receive data on import
    let array_ptr = Box::new(Ffi_ArrowArray::empty());
    let schema_ptr = Box::new(Ffi_ArrowSchema::empty());

    // reqlinquish ownership to allow thread-safe write
    let array_ptr = Box::into_raw(array_ptr);
    let schema_ptr = Box::into_raw(schema_ptr);

    // PRODUCER
    unsafe {
        export(array.clone(), array_ptr, schema_ptr);
    };

    // take ownership back in order to deallocate
    let array_ptr = unsafe { Box::from_raw(array_ptr) };
    let schema_ptr = unsafe { Box::from_raw(schema_ptr) };

    // interpret memory into new array
    let new_array = unsafe { import(array_ptr, schema_ptr.as_ref())? };

    assert_eq!(array.as_ref(), new_array.as_ref());

    Ok(())
}
