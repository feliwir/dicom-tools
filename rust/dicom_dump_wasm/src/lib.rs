use dicom_object::from_reader;
use serde_json::{json, Map, Value};
use std::io::Cursor;
use wasm_bindgen::prelude::*;

const PIXEL_DATA_TAG: &str = "7FE00010";
const MAX_INLINE_BINARY_LENGTH: usize = 16_384;
const MAX_VALUE_JSON_LENGTH: usize = 65_536;

fn strip_large_elements(dataset: &mut Map<String, Value>) {
    let keys: Vec<String> = dataset.keys().cloned().collect();

    for tag in keys {
        let Some(element_value) = dataset.get_mut(&tag) else {
            continue;
        };

        let Some(element_object) = element_value.as_object_mut() else {
            continue;
        };

        let vr = element_object
            .get("vr")
            .and_then(Value::as_str)
            .unwrap_or("UN")
            .to_string();

        let is_pixel_data = tag.eq_ignore_ascii_case(PIXEL_DATA_TAG);
        let has_bulk_uri = element_object.contains_key("BulkDataURI");

        let inline_binary_length = element_object
            .get("InlineBinary")
            .and_then(Value::as_str)
            .map(str::len)
            .unwrap_or(0);

        let value_json_length = element_object
            .get("Value")
            .map(Value::to_string)
            .map(|value| value.len())
            .unwrap_or(0);

        let is_large_value =
            inline_binary_length > MAX_INLINE_BINARY_LENGTH || value_json_length > MAX_VALUE_JSON_LENGTH;

        if is_pixel_data || has_bulk_uri || is_large_value {
            let reason = if is_pixel_data {
                "<stripped pixel data>"
            } else {
                "<stripped large value>"
            };

            *element_value = json!({
                "vr": vr,
                "Value": [reason]
            });
            continue;
        }

        if let Some(sequence_items) = element_object.get_mut("Value").and_then(Value::as_array_mut) {
            for sequence_item in sequence_items {
                if let Some(nested_dataset) = sequence_item.as_object_mut() {
                    strip_large_elements(nested_dataset);
                }
            }
        }
    }
}

#[wasm_bindgen]
pub fn dicom_bytes_to_json(bytes: &[u8]) -> Result<String, JsValue> {
    let cursor = Cursor::new(bytes);
    let dicom = from_reader(cursor).map_err(|error| JsValue::from_str(&error.to_string()))?;

    let mut json_value = dicom_json::to_value(&*dicom).map_err(|error| JsValue::from_str(&error.to_string()))?;

    if let Some(root_dataset) = json_value.as_object_mut() {
        strip_large_elements(root_dataset);
    }

    serde_json::to_string(&json_value).map_err(|error| JsValue::from_str(&error.to_string()))
}
