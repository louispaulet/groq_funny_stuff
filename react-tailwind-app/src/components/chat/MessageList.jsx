import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function computeGrouping(messages) {
  return messages.map((m, idx, arr) => {
    const prev = idx > 0 ? arr[idx - 1] : null
    const next = idx < arr.length - 1 ? arr[idx + 1] : null
    const isFirstOfGroup = !prev || prev.role !== m.role
    const isLastOfGroup = !next || next.role !== m.role
    return { ...m, isFirstOfGroup, isLastOfGroup }
  })
}

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 thin-scrollbar">
      <div className="flex flex-col gap-3">
        {computeGrouping(messages).map((m, idx) => (
          <MessageBubble
            key={idx}
            role={m.role}
            content={m.content}
            name={m.name}
            timestamp={m.timestamp}
            showAvatar={m.isFirstOfGroup}
            showName={m.isFirstOfGroup}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
