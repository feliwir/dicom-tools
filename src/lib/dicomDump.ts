import { loadDumpWasmModule } from "./dumpWasmClient";

export const convertDicomBytesToJson = async (
  bytes: Uint8Array,
): Promise<unknown> => {
  const wasm = await loadDumpWasmModule();
  const raw = wasm.dicom_bytes_to_json(bytes);

  return JSON.parse(raw);
};
