export type ValidationError = {
  message: string
  line?: number | null
  column?: number | null
}

export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
}

type DicomWasmModule = {
  default: () => Promise<unknown>
  validate_dicom_json: (input: string) => string
}

let wasmModulePromise: Promise<DicomWasmModule> | null = null

const loadWasmModule = async (): Promise<DicomWasmModule> => {
  if (!wasmModulePromise) {
    wasmModulePromise = (async () => {
      const wasm = (await import('../wasm/pkg/dicom_json_wasm.js')) as DicomWasmModule
      await wasm.default()
      return wasm
    })()
  }

  return wasmModulePromise
}

export const validateDicomJson = async (input: string): Promise<ValidationResult> => {
  try {
    const wasm = await loadWasmModule()
    const raw = wasm.validate_dicom_json(input)

    return JSON.parse(raw) as ValidationResult
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown WASM error'

    return {
      valid: false,
      errors: [{ message: `Validator runtime error: ${message}`, line: null, column: null }],
    }
  }
}
