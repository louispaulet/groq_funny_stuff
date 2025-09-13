import { PaperAirplaneIcon, StopIcon, TrashIcon } from '@heroicons/react/24/solid'

export default function Composer({ value, onChange, onSend, onStop, loading, onClear }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!loading) onSend?.() }}
      className="sticky bottom-0 w-full"
    >
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm backdrop-blur">
        <textarea
          className="block w-full resize-none rounded-xl border-none bg-transparent p-3 text-sm focus:outline-none"
          rows={2}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Ask anything… (Shift+Enter for newline)"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (!loading) onSend?.()
            }
          }}
        />
        <div className="flex items-center gap-2 pr-1">
          {loading ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex items-center rounded-xl bg-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-300"
              title="Stop"
            >
              <StopIcon className="h-5 w-5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center rounded-xl bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
                title="Clear"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
              <button
                type="submit"
                disabled={!value.trim()}
                className="inline-flex items-center rounded-xl bg-brand-600 px-4 py-2 text-white shadow hover:bg-brand-700 disabled:opacity-60"
                title="Send"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </form>
  )
}
