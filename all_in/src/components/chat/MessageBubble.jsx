import { lazy, Suspense, useMemo } from 'react'
import { toSafeHtml } from '../../lib/markdown'
import { formatTime } from '../../lib/time'
import ErrorBoundary from '../common/ErrorBoundary'
import { SparklesIcon, UserCircleIcon } from '@heroicons/react/24/outline'

const STLViewer = lazy(() => import('../stl/STLViewer'))

function extractStlSources(text) {
  if (!text) return []
  const sources = []
  const urlRegex = /(https?:\/\/\S+?\.stl)\b/gi
  const urlSet = new Set()
  let match
  while ((match = urlRegex.exec(text)) !== null) urlSet.add(match[1])
  for (const url of urlSet) sources.push({ type: 'url', url })
  const lowerText = text.toLowerCase()
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g
  let fenceMatch
  while ((fenceMatch = fenceRegex.exec(text)) !== null) {
    const lang = (fenceMatch[1] || '').trim().toLowerCase()
    const body = fenceMatch[2] || ''
    const bodyLower = body.toLowerCase()
    const facetCount = (bodyLower.match(/facet normal/g) || []).length
    const looksLikeStl = lang === 'stl' || bodyLower.startsWith('solid') || (facetCount >= 4 && bodyLower.includes('vertex'))
    if (looksLikeStl) {
      sources.push({ type: 'text', text: body.trim() })
    }
  }
  const totalFacets = (lowerText.match(/facet normal/g) || []).length
  const hasSolid = /(\n|^)\s*solid\b/.test(lowerText)
  if ((hasSolid && totalFacets >= 1) || (totalFacets >= 4 && lowerText.includes('vertex'))) {
    if (!sources.some((source) => source.type === 'text')) {
      sources.push({ type: 'text', text: text.trim() })
    }
  }
  return sources
}

export default function MessageBubble({ experience, role, content, name, timestamp, streaming = false, showAvatar = true, showName = true }) {
  const isUser = role === 'user'
  const enableStl = Boolean(experience?.enableStlViewer)
  const stlSources = useMemo(() => (enableStl ? extractStlSources(content) : []), [content, enableStl])
  const maybeStl = useMemo(() => {
    if (!enableStl) return false
    const lower = (content || '').toLowerCase()
    const signals = [
      lower.includes('.stl'),
      lower.includes('facet normal'),
      lower.includes('vertex '),
      lower.includes('outer loop'),
    ]
    return signals.filter(Boolean).length >= 2
  }, [content, enableStl])

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && showAvatar && (
        <div className="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-brand-600 text-white">
          <div className="grid h-full w-full place-items-center">
            <SparklesIcon className="h-4 w-4" />
          </div>
        </div>
      )}
      <div
        className={
          isUser
            ? 'max-w-[80%] rounded-2xl bg-indigo-600 px-4 py-2 text-sm text-white shadow'
            : 'max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
        }
      >
        {showName && (
          <div className={`mb-1 text-xs ${isUser ? 'text-indigo-100/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {name} • {formatTime(timestamp)}
          </div>
        )}
        {isUser ? (
          <div className="whitespace-pre-wrap">{content}</div>
        ) : (
          // eslint-disable-next-line react/no-danger
          <div className="prose" dangerouslySetInnerHTML={{ __html: toSafeHtml(content) }} />
        )}

        {enableStl && stlSources.length > 0 && !streaming && (
          <div className="mt-2">
            <ErrorBoundary>
              <Suspense fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer...</div>}>
                <STLViewer source={stlSources[0]} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        {enableStl && stlSources.length > 0 && streaming && (
          <div className="mt-2 text-xs text-slate-500">3D preview will appear when the response finishes...</div>
        )}
        {enableStl && stlSources.length === 0 && !streaming && maybeStl && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Looks like STL text, but it may be incomplete. Wrap it in a fenced block (```stl ... ```), or include full facets.
          </div>
        )}
      </div>
      {isUser && showAvatar && (
        <div className="ml-2 mt-1 h-7 w-7 shrink-0 rounded-full bg-slate-200 text-slate-600">
          <div className="grid h-full w-full place-items-center">
            <UserCircleIcon className="h-4 w-4" />
          </div>
        </div>
      )}
    </div>
  )
}
