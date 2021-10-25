use std::collections::{BTreeMap, HashMap};

use arrow2::datatypes::{DataType, Field, Schema};

pub fn main() {
    // logical types
    let type1 = DataType::Date32;
    let type2 = DataType::Int32;

    // fields / columns
    let field1 = Field::new("c1", type1, true);
    let field2 = Field::new("c2", type2, true);

    // metadata on columns
    let mut metadata = BTreeMap::new();
    metadata.insert("key".to_string(), "value".to_string());
    let field1 = field1.with_metadata(metadata);

    // create schema from fields with new metadata
    let schema = Schema::new(vec![field1, field2]);
    assert_eq!(schema.fields().len(), 2);

    // add metadata to schema as well with HashMap
    let mut metadata = HashMap::new();
    metadata.insert("key".to_string(), "value".to_string());
    let schema = schema.with_metadata(metadata);
    assert_eq!(schema.fields().len(), 2);
}
