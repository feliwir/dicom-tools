import { dicomJsonValidatorTool } from "./dicomJsonValidator/toolDefinition";
import { dicomDumpTool } from "./dicomDump/toolDefinition";
import type { ToolDefinition } from "./types";

export const toolRegistry: ToolDefinition[] = [
  dicomJsonValidatorTool,
  dicomDumpTool,
];
