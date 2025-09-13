import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

export default function MessageList({ messages }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-4 thin-scrollbar">
      <div className="flex flex-col gap-3">
        {messages.map((m, idx) => (
          <MessageBubble key={idx} role={m.role} content={m.content} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
