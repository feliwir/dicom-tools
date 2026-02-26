use dicom_object::mem::InMemDicomObject;
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct ValidationError {
    message: String,
    line: Option<usize>,
    column: Option<usize>,
}

#[derive(Serialize)]
struct ValidationResult {
    valid: bool,
    errors: Vec<ValidationError>,
}

fn from_serde_error(error: serde_json::Error) -> ValidationError {
    let line = error.line();
    let column = error.column();

    ValidationError {
        message: error.to_string(),
        line: if line == 0 { None } else { Some(line) },
        column: if column == 0 { None } else { Some(column) },
    }
}

#[wasm_bindgen]
pub fn validate_dicom_json(input: &str) -> String {
    let mut errors = Vec::new();

    if let Err(error) = serde_json::from_str::<serde_json::Value>(input) {
        errors.push(from_serde_error(error));
    } else if let Err(error) = dicom_json::from_str::<InMemDicomObject>(input) {
        errors.push(from_serde_error(error));
    }

    let result = ValidationResult {
        valid: errors.is_empty(),
        errors,
    };

    serde_json::to_string(&result).unwrap_or_else(|_| {
        "{\"valid\":false,\"errors\":[{\"message\":\"Failed to serialize validation result\",\"line\":null,\"column\":null}]}"
            .to_string()
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_dicom_json() {
        let input = r#"{
            "00080020": {"vr": "DA", "Value": ["20210101"]},
            "00080030": {"vr": "TM", "Value": ["120000"]},
            "00080050": {"vr": "SH", "Value": ["12345"]},
            "00080060": {"vr": "CS", "Value": ["CT"]}
        }"#;

        let result = validate_dicom_json(input);
        let expected = r#"{"valid":true,"errors":[]}"#;
        assert_eq!(result, expected);
    }

    #[test]
    fn test_invalid_dicom_json() {
        let input = r#"{
            "00080020": {"vr": "DA", "Value": ["20210101"]},
            "00080030": {"vr": "TM", "Value": ["120000"]},
            "00080050": {"vr": "SH", "Value": ["12345"]},
            "00080060": {"vr": "CS", "Value": ["CT"]
        }"#; // Missing closing brace

        let result = validate_dicom_json(input);
        let expected = r#"{"valid":false,"errors":[{"message":"EOF while parsing object at line 5 column 9","line":5,"column":9}]}"#;
    }
}
