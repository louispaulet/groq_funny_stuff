import { toSafeHtml } from '../../lib/markdown'
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-brand-600 text-white grid place-items-center">
          <SparklesIcon className="h-4 w-4" />
        </div>
      )}
      <div
        className={
          isUser
            ? 'max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white shadow'
            : 'max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm'
        }
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          // eslint-disable-next-line react/no-danger
          <div className="prose" dangerouslySetInnerHTML={{ __html: toSafeHtml(content) }} />
        )}
      </div>
      {isUser && (
        <div className="ml-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-slate-200 text-slate-600 grid place-items-center">
          <UserCircleIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
