import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default function MermaidCanvas({ diagramTitle, diagramPrompt, sanitizedDiagram, rendering }) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Live Mermaid canvas</h2>
          {diagramTitle ? <p className="text-sm text-slate-600 dark:text-slate-300">{diagramTitle}</p> : null}
        </div>
        {diagramPrompt ? (
          <span className="max-w-xs text-right text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{diagramPrompt}</span>
        ) : null}
      </div>
      <div className="relative min-h-[16rem] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
        {rendering ? (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Rendering Mermaid diagram…</span>
            </div>
          </div>
        ) : null}
        {sanitizedDiagram ? (
          <div className={`transition-opacity ${rendering ? 'opacity-0' : 'opacity-100'}`}>
            <div
              className="mermaid-diagram w-full text-slate-900 dark:text-slate-100"
              dangerouslySetInnerHTML={{ __html: sanitizedDiagram }}
            />
          </div>
        ) : (
          !rendering && (
            <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
              No diagram rendered yet. Describe a scene above to see Mermaid in action.
            </div>
          )
        )}
      </div>
    </section>
  )
}
