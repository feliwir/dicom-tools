import type { ComponentType } from 'react'

export type ToolDefinition = {
  id: string
  title: string
  description: string
  component: ComponentType
}
