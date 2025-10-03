import { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'

function computeGrouping(messages) {
  return messages.map((message, index, array) => {
    const previous = index > 0 ? array[index - 1] : null
    const next = index < array.length - 1 ? array[index + 1] : null
    const isFirstOfGroup = !previous || previous.role !== message.role
    const isLastOfGroup = !next || next.role !== message.role
    return { ...message, isFirstOfGroup, isLastOfGroup }
  })
}

export default function MessageList({ experience, messages }) {
  const bottomRef = useRef(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="h-[65vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm thin-scrollbar dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-3">
        {computeGrouping(messages).map((message, index) => (
          <MessageBubble
            key={index}
            experience={experience}
            role={message.role}
            content={message.content}
            name={message.name}
            timestamp={message.timestamp}
            streaming={message.streaming}
            showAvatar={message.isFirstOfGroup}
            showName={message.isFirstOfGroup}
            sources={message.sources}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
