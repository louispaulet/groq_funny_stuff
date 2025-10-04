import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export default function Assist({ prompt, setPrompt, chatMessages, chatLoading, onSend, onAdopt }) {
  const canSend = !!prompt.trim() && !chatLoading
  const lastAssistantMessage = [...chatMessages].reverse().find((m) => m.role === 'assistant')
  const hasAssistantSchema = Boolean(lastAssistantMessage)

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (canSend) onSend()
  }

  return (
    <section className="md:col-span-5 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Assistant Schema Builder</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Describe the object you want. The assistant will propose a single JSON schema.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              spellCheck={false}
              className="block w-full rounded-lg border border-slate-300 bg-white/90 p-3 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
              placeholder="Ask for a schema idea…"
            />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-500 disabled:opacity-50"
              >
                {chatLoading ? (
                  'Sending…'
                ) : (
                  <>
                    <span>Send to assistant</span>
                    <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Apply the assistant schema</h4>
            <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
              Review the latest assistant reply below. When it looks good, send it to the Schema Setup card so you can validate and fine-tune it.
            </p>
          </div>
          <button
            type="button"
            onClick={onAdopt}
            disabled={!hasAssistantSchema}
            className="inline-flex items-center gap-1 rounded-md border border-amber-600 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 disabled:opacity-50 dark:border-amber-400 dark:text-amber-200 dark:hover:bg-amber-500/20"
          >
            <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
            Send to Schema Setup
          </button>
        </div>
        <div className="mt-3 max-h-64 space-y-2 overflow-auto">
          {chatMessages.length ? (
            chatMessages.map((m, i) => (
              <div
                key={i}
                className={`rounded-md border p-2 text-sm ${
                  m.role === 'user'
                    ? 'border-amber-200 bg-white text-slate-800 dark:border-amber-400/40 dark:bg-amber-500/10'
                    : 'border-amber-300 bg-amber-100/80 text-amber-900 dark:border-amber-400/60 dark:bg-amber-500/20 dark:text-amber-50'
                }`}
              >
                <div className="mb-1 text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-200/80">{m.role}</div>
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              </div>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-amber-300 p-3 text-xs text-amber-700 dark:border-amber-400/50 dark:text-amber-200">No assistant replies yet. Ask the assistant for a schema to get started.</div>
          )}
        </div>
        {!hasAssistantSchema ? (
          <p className="mt-2 text-[11px] font-medium text-amber-800/80 dark:text-amber-200/70">Send a prompt to the assistant first—then this button will push the suggested schema into the editor.</p>
        ) : null}
      </div>
    </section>
  )
}
