import { useState } from 'react'
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline'

export default function Sidebar({ conversations, activeId, onSelect, onNew, onRename }) {
  const [editingId, setEditingId] = useState(null)
  const [tmpTitle, setTmpTitle] = useState('')

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-3 shadow-sm">
      <button
        type="button"
        onClick={onNew}
        className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
      >
        <PlusIcon className="h-5 w-5" /> New Chat
      </button>
      <div className="space-y-1">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`group flex items-center justify-between rounded-xl border px-3 py-2 text-sm cursor-pointer ${
              c.id === activeId ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-slate-800 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onClick={() => onSelect?.(c.id)}
          >
            {editingId === c.id ? (
              <form
                onSubmit={(e) => { e.preventDefault(); onRename?.(c.id, tmpTitle || c.title); setEditingId(null) }}
                className="flex grow items-center gap-2"
              >
                <input
                  autoFocus
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-slate-700"
                  defaultValue={c.title}
                  onChange={(e) => setTmpTitle(e.target.value)}
                  onBlur={() => setEditingId(null)}
                />
              </form>
            ) : (
              <div className="truncate pr-2">{c.title}</div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditingId(c.id); setTmpTitle(c.title) }}
              className="invisible group-hover:visible rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              title="Rename"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
