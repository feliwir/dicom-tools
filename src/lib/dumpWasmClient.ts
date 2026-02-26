type DicomDumpWasmModule = {
  default: () => Promise<unknown>;
  dicom_bytes_to_json: (input: Uint8Array) => string;
};

let dumpWasmModulePromise: Promise<DicomDumpWasmModule> | null = null;

export const loadDumpWasmModule = async (): Promise<DicomDumpWasmModule> => {
  if (!dumpWasmModulePromise) {
    dumpWasmModulePromise = (async () => {
      const wasm =
        (await import("../wasm/dump/dicom_dump_wasm.js")) as DicomDumpWasmModule;
      await wasm.default();
      return wasm;
    })();
  }

  return dumpWasmModulePromise;
};
