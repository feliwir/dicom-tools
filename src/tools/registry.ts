import { dicomJsonValidatorTool } from './dicomJsonValidator/toolDefinition'
import type { ToolDefinition } from './types'

export const toolRegistry: ToolDefinition[] = [dicomJsonValidatorTool]
