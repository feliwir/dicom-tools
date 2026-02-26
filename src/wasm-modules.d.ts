declare module "../wasm/pkg/dicom_json_wasm.js" {
  const init: () => Promise<unknown>;
  export default init;
  export function validate_dicom_json(input: string): string;
}

declare module "../wasm/dump/dicom_dump_wasm.js" {
  const init: () => Promise<unknown>;
  export default init;
  export function dicom_bytes_to_json(input: Uint8Array): string;
}
