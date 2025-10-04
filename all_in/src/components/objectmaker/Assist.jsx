import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

export default function Assist({ prompt, setPrompt, chatMessages, chatLoading, onSend, onAdopt }) {
  const canSend = !!prompt.trim() && !chatLoading

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
    <section className="md:col-span-6 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">LLM Assist</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Describe the object you want. The assistant proposes a single JSON schema (type: object) you can adopt.
      </p>
      <div className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onAdopt}
              className="inline-flex items-center gap-1 rounded-md border border-amber-600 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-500/60 dark:text-amber-300 dark:hover:bg-amber-500/10"
            >
              <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
              Use assistant schema
            </button>
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-500 disabled:opacity-50"
            >
              {chatLoading ? (
                'Sending…'
              ) : (
                <>
                  <span>Send</span>
                  <PaperAirplaneIcon className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </form>
        <div className="mt-3 max-h-64 space-y-2 overflow-auto">
          {chatMessages.map((m, i) => (
            <div key={i} className={`rounded-md p-2 text-sm ${m.role === 'user' ? 'bg-yellow-50 text-slate-800 dark:bg-yellow-500/10' : 'bg-slate-50 text-slate-700 dark:bg-slate-800/50 dark:text-slate-200'}`}>
              <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{m.role}</div>
              <div className="whitespace-pre-wrap break-words">{m.content}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
