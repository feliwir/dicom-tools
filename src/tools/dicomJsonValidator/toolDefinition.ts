import type { ToolDefinition } from '../types'
import { DicomJsonValidatorTool } from './DicomJsonValidatorTool'

export const dicomJsonValidatorTool: ToolDefinition = {
  id: 'dicom-json-validator',
  title: 'DICOM-JSON Validator',
  description: 'Validate DICOM JSON using Rust + WebAssembly.',
  component: DicomJsonValidatorTool,
}
