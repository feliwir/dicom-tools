import type { ToolDefinition } from "../types";
import { DicomDumpTool } from "./DicomDumpTool";

export const dicomDumpTool: ToolDefinition = {
  id: "dicom-dump",
  title: "DICOM Dump",
  description: "Convert DICOM file(s) to DICOM-JSON.",
  component: DicomDumpTool,
};
