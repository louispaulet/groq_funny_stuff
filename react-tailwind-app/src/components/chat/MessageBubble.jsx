import { toSafeHtml } from '../../lib/markdown'
import { formatTime } from '../../lib/time'
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { lazy, Suspense, useMemo } from 'react'
const STLViewer = lazy(() => import('../stl/STLViewer'))

function extractStlSources(text) {
  if (!text) return []
  const sources = []
  // 1) URLs ending in .stl
  const reUrl = /(https?:\/\/[^\s)]+\.stl)\b/gi
  const urlSet = new Set()
  let m
  while ((m = reUrl.exec(text)) !== null) urlSet.add(m[1])
  for (const url of urlSet) sources.push({ type: 'url', url })

  // 2) Fenced code blocks ```stl ... ``` or generic containing STL markers
  const fenceRe = /```(\w+)?\s*([\s\S]*?)```/g
  let fm
  while ((fm = fenceRe.exec(text)) !== null) {
    const lang = (fm[1] || '').toLowerCase()
    const body = fm[2] || ''
    const looksStl = lang === 'stl' || (/(?:^|\n)\s*facet\s+normal\b/i.test(body) && /(?:^|\n)\s*vertex\b/i.test(body))
    if (looksStl) sources.push({ type: 'text', text: body.trim() })
  }

  // 3) Whole-message STL (ASCII) — if it includes multiple STL markers
  const markerCount = (text.match(/\bfacet\s+normal\b/gi) || []).length
  if (markerCount >= 2 && /\bvertex\b/i.test(text) && /\bouter\s+loop\b/i.test(text)) {
    // Avoid duplicating if we already captured via fences
    if (!sources.some((s) => s.type === 'text')) sources.push({ type: 'text', text: text.trim() })
  }

  return sources
}

export default function MessageBubble({ role, content, name, timestamp, showAvatar = true, showName = true }) {
  const isUser = role === 'user'
  const stlSources = useMemo(() => extractStlSources(content), [content])
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && showAvatar && (
        <div className="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-brand-600 text-white grid place-items-center">
          <SparklesIcon className="h-4 w-4" />
        </div>
      )}
      <div
        className={
          isUser
            ? 'max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white shadow'
            : 'max-w-[80%] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-800 dark:text-slate-100 shadow-sm'
        }
      >
        {showName && (
          <div className={`mb-1 text-xs ${isUser ? 'text-indigo-100/80' : 'text-slate-500'}`}>
            {name} • {formatTime(timestamp)}
          </div>
        )}
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          // eslint-disable-next-line react/no-danger
          <div className="prose" dangerouslySetInnerHTML={{ __html: toSafeHtml(content) }} />
        )}

        {stlSources.length > 0 && (
          <div className="mt-2">
            {stlSources.map((s, idx) => (
              <Suspense key={idx} fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer…</div>}>
                <STLViewer source={s} />
              </Suspense>
            ))}
          </div>
        )}
      </div>
      {isUser && showAvatar && (
        <div className="ml-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-slate-200 text-slate-600 grid place-items-center">
          <UserCircleIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}
