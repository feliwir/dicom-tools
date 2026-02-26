import { useMemo, useState } from 'react'
import { ToolSidebar } from './components/ToolSidebar'
import { toolRegistry } from './tools/registry'

function App() {
  const [activeToolId, setActiveToolId] = useState(toolRegistry[0]?.id ?? '')

  const activeTool = useMemo(
    () => toolRegistry.find((tool) => tool.id === activeToolId) ?? toolRegistry[0],
    [activeToolId],
  )

  if (!activeTool) {
    return null
  }

  const ActiveToolComponent = activeTool.component

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-3xl font-semibold">DICOM Tools</h1>
          <p className="mt-2 text-sm text-slate-300">Select a tool from the sidebar.</p>
        </header>

        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <ToolSidebar
            tools={toolRegistry}
            activeToolId={activeTool.id}
            onSelectTool={setActiveToolId}
          />
          <ActiveToolComponent />
        </div>
      </div>
    </main>
  )
}

export default App
