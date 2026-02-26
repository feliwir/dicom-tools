import { loadWasmModule } from "./wasmClient";

export type ValidationError = {
  message: string;
  line?: number | null;
  column?: number | null;
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export const validateDicomJson = async (
  input: string,
): Promise<ValidationResult> => {
  try {
    const wasm = await loadWasmModule();
    const raw = wasm.validate_dicom_json(input);

    return JSON.parse(raw) as ValidationResult;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown WASM error";

    return {
      valid: false,
      errors: [
        {
          message: `Validator runtime error: ${message}`,
          line: null,
          column: null,
        },
      ],
    };
  }
};
