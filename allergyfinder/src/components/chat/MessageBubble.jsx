import { toSafeHtml } from '../../lib/markdown'
import { formatTime } from '../../lib/time'
import { UserCircleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { lazy, Suspense, useMemo } from 'react'
const STLViewer = lazy(() => import('../stl/STLViewer'))
import ErrorBoundary from '../common/ErrorBoundary'

function extractStlSources(text) {
  if (!text) return []
  const sources = []

  // 1) URLs ending with .stl
  const urlRegex = /(https?:\/\/\S+?\.stl)\b/gi
  const urlSet = new Set()
  let um
  while ((um = urlRegex.exec(text)) !== null) urlSet.add(um[1])
  for (const url of urlSet) sources.push({ type: 'url', url })

  // Prepare lower-cased text for simple includes checks
  const lower = text.toLowerCase()

  // 2) Fenced code blocks: ```stl ...``` or blocks that clearly look like STL
  const fenceRegex = /```([^\n`]*)\n([\s\S]*?)```/g
  let fm
  while ((fm = fenceRegex.exec(text)) !== null) {
    const lang = (fm[1] || '').trim().toLowerCase()
    const body = (fm[2] || '')
    const bodyLower = body.toLowerCase()
    const facetCount = (bodyLower.match(/facet normal/g) || []).length
    const looksStl = lang === 'stl' || bodyLower.startsWith('solid') || (facetCount >= 4 && bodyLower.includes('vertex'))
    if (looksStl) sources.push({ type: 'text', text: body.trim() })
  }

  // 3) Whole-message ASCII STL heuristic (allow preface text)
  const facetAll = (lower.match(/facet normal/g) || []).length
  const hasSolidLine = /(\n|^)\s*solid\b/.test(lower)
  if ((hasSolidLine && facetAll >= 1) || (facetAll >= 4 && lower.includes('vertex'))) {
    if (!sources.some((s) => s.type === 'text')) sources.push({ type: 'text', text: text.trim() })
  }

  return sources
}

export default function MessageBubble({ role, content, name, timestamp, streaming = false, showAvatar = true, showName = true, sources = [] }) {
  const isUser = role === 'user'
  const stlSources = useMemo(() => extractStlSources(content), [content])
  const maybeStl = useMemo(() => {
    const lower = (content || '').toLowerCase()
    const signals = [
      lower.includes('.stl'),
      lower.includes('facet normal'),
      lower.includes('vertex '),
      lower.includes('outer loop'),
    ]
    return signals.filter(Boolean).length >= 2
  }, [content])
  const hasSources = !isUser && Array.isArray(sources) && sources.length > 0
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
          <div className="prose" dangerouslySetInnerHTML={{ __html: toSafeHtml(content) }} />
        )}

        {stlSources.length > 0 && !streaming && (
          <div className="mt-2">
            <ErrorBoundary>
              <Suspense fallback={<div className="h-64 grid place-items-center text-slate-500">Loading 3D viewer…</div>}>
                {/* Render at most one viewer per message for stability */}
                <STLViewer source={stlSources[0]} />
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
        {stlSources.length > 0 && streaming && (
          <div className="mt-2 text-xs text-slate-500">3D preview will appear when the response finishes…</div>
        )}
        {stlSources.length === 0 && !streaming && maybeStl && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Looks like STL text, but it may be incomplete. Wrap it in a fenced block (```stl … ```), or include full facets.
          </div>
        )}
        {hasSources && (
          <details className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <summary className="cursor-pointer font-medium text-slate-600 dark:text-slate-200">Sources</summary>
            <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-200">
              {sources.map((source, idx) => {
                const key = source.url || source.code || idx
                const label = source.label || source.url || 'OpenFoodFacts'
                return (
                  <li key={key} className="leading-snug">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline decoration-dotted underline-offset-4 hover:text-brand-600 dark:hover:text-brand-400"
                      >
                        {label}
                      </a>
                    ) : (
                      <span>{label}</span>
                    )}
                    {source.code && (
                      <span className="ml-1 text-slate-400 dark:text-slate-500">#{source.code}</span>
                    )}
                    {source.note && (
                      <span className="ml-1 text-slate-400 dark:text-slate-500">({source.note})</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </details>
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
