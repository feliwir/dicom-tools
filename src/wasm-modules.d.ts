declare module '../wasm/pkg/dicom_json_wasm.js' {
  const init: () => Promise<unknown>
  export default init
  export function validate_dicom_json(input: string): string
}
