import type { ToolDefinition } from "../tools/types";

type ToolSidebarProps = {
  tools: ToolDefinition[];
  activeToolId: string;
  onSelectTool: (toolId: string) => void;
};

export function ToolSidebar({
  tools,
  activeToolId,
  onSelectTool,
}: ToolSidebarProps) {
  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
        Tools
      </h2>
      <nav className="space-y-2">
        {tools.map((tool) => {
          const isActive = tool.id === activeToolId;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onSelectTool(tool.id)}
              className={`w-full rounded-md border px-3 py-2 text-left transition ${
                isActive
                  ? "border-indigo-400 bg-indigo-500/20 text-indigo-100"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500"
              }`}
            >
              <p className="text-sm font-medium">{tool.title}</p>
              <p className="mt-1 text-xs text-slate-400">{tool.description}</p>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
