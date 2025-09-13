export default function Composer({ value, onChange, onSend, onStop, loading, onClear }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!loading) onSend?.() }}
      className="flex items-end gap-2"
    >
      <textarea
        className="block w-full rounded-md border border-slate-300 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        rows={2}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Type a message (Shift+Enter for newline)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!loading) onSend?.()
          }
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? 'Streaming…' : 'Send'}
        </button>
        {loading ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}

