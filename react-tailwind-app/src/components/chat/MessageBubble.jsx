import { toSafeHtml } from '../../lib/markdown'

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={
          isUser
            ? 'max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white shadow'
            : 'max-w-[80%] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 shadow-sm'
        }
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: toSafeHtml(content) }} />
        )}
      </div>
    </div>
  )
}

