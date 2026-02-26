type DicomWasmModule = {
  default: () => Promise<unknown>;
  validate_dicom_json: (input: string) => string;
};

let wasmModulePromise: Promise<DicomWasmModule> | null = null;

export const loadWasmModule = async (): Promise<DicomWasmModule> => {
  if (!wasmModulePromise) {
    wasmModulePromise = (async () => {
      const wasm =
        (await import("../wasm/pkg/dicom_json_wasm.js")) as DicomWasmModule;
      await wasm.default();
      return wasm;
    })();
  }

  return wasmModulePromise;
};
