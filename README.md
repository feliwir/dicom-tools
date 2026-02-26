# DICOM JSON Validator

React SPA built with Vite + Tailwind CSS.

## Tool included

- DICOM-JSON Validator with Monaco editor (line numbers + syntax highlighting)
- Validation powered by Rust WebAssembly using `dicom_json` (Enet4)
- Validation errors shown with message, line, and column (when available)

## Requirements

- Node.js 20+
- Rust toolchain
- `wasm-pack`

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` builds the Rust WASM package first, then starts Vite.

## Build

```bash
npm run build
```

This compiles Rust to WASM, runs TypeScript checks, and builds the production frontend bundle.
