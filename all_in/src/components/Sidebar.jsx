import { useState } from 'react'
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onFlushHistory,
  disableNew = false,
  disableFlush = false,
}) {
  const [editingId, setEditingId] = useState(null)
  const [tmpTitle, setTmpTitle] = useState('')

  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={onNew}
        disabled={disableNew}
        className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-600/60"
      >
        <PlusIcon className="h-5 w-5" /> New chat
      </button>
      {onFlushHistory ? (
        <button
          type="button"
          onClick={onFlushHistory}
          disabled={disableFlush}
          className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
        >
          <TrashIcon className="h-5 w-5" /> Delete saved chats
        </button>
      ) : null}
      <div className="space-y-1">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`group flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
              conversation.id === activeId
                ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-slate-800 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            onClick={() => onSelect?.(conversation.id)}
          >
            {editingId === conversation.id ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  onRename?.(conversation.id, tmpTitle || conversation.title)
                  setEditingId(null)
                }}
                className="flex grow items-center gap-2"
              >
                <input
                  autoFocus
                  className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  defaultValue={conversation.title}
                  onChange={(event) => setTmpTitle(event.target.value)}
                  onBlur={() => setEditingId(null)}
                />
              </form>
            ) : (
              <div className="truncate pr-2 text-sm font-medium">{conversation.title}</div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setEditingId(conversation.id)
                setTmpTitle(conversation.title)
              }}
              className="invisible rounded-md p-1 text-slate-500 transition group-hover:visible hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
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