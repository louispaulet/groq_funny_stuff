import { useEffect, useState } from 'react'
import { ArrowPathIcon, ClipboardDocumentIcon, TrashIcon } from '@heroicons/react/24/outline'
import { clearSvgHistory, readSvgHistory, writeSvgHistory, SVG_HISTORY_COOKIE_LIMIT } from '../lib/svgHistoryCookie'

function computeDataUrl({ dataUrl, svgMarkup }) {
  if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl
  }
  if (typeof svgMarkup === 'string' && svgMarkup.trim()) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup.trim())}`
  }
  return ''
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function HistoryItem({ entry, onSelect }) {
  const previewSrc = computeDataUrl(entry)
  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-3 text-left shadow-sm transition hover:border-brand-400 hover:bg-brand-50/70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-300"
    >
      <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
        {previewSrc ? (
          <img src={previewSrc} alt={entry.prompt || 'Saved SVG preview'} className="h-24 w-full object-contain" loading="lazy" />
        ) : (
          <div className="flex h-24 items-center justify-center text-xs text-slate-400 dark:text-slate-500">No preview</div>
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-medium text-slate-700 dark:text-slate-200">{entry.prompt || 'Saved request'}</p>
        {entry.route ? (
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {entry.route === 'svg_deluxe' ? 'Deluxe /svg_deluxe (oss-120B)' : 'Standard /svg (Llama 3 70B)'}
          </p>
        ) : null}
        {entry.timestamp ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(entry.timestamp)}</p>
        ) : null}
      </div>
    </button>
  )
}

export default function SvgPlaygroundPage({ experience }) {
  const [prompt, setPrompt] = useState('A cheerful robot painting geometric trees')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [useDeluxeRoute, setUseDeluxeRoute] = useState(false)

  useEffect(() => {
    setHistory(readSvgHistory())
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const apiBaseUrl = experience?.svgApiBaseUrl || experience?.defaultBaseUrl || 'https://groq-endpoint.louispaulet13.workers.dev'
  const routeSegment = useDeluxeRoute ? 'svg_deluxe' : 'svg'

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Please enter a prompt for the SVG generator.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestUrl = new URL(
        `${apiBaseUrl.replace(/\/$/, '')}/${routeSegment}/${encodeURIComponent(trimmedPrompt)}`,
      )
      const response = await fetch(requestUrl.toString())
      if (!response.ok) {
        let message = `Generation failed with status ${response.status}`
        try {
          const problem = await response.json()
          if (problem?.error) {
            message = problem.error
          }
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const payload = await response.json()
      const svgMarkup = typeof payload?.svg === 'string' ? payload.svg.trim() : ''
      const dataUrl = computeDataUrl({
        dataUrl: typeof payload?.dataUrl === 'string' ? payload.dataUrl.trim() : '',
        svgMarkup,
      })
      if (!dataUrl) {
        throw new Error('The SVG response did not include renderable markup.')
      }

      const normalizedPrompt = typeof payload?.prompt === 'string' && payload.prompt.trim()
        ? payload.prompt.trim()
        : trimmedPrompt

      const nextResult = {
        prompt: normalizedPrompt,
        dataUrl,
        svgMarkup,
        raw: payload,
        route: routeSegment,
      }

      setResult(nextResult)

      const createdAt = Date.now()
      const newEntry = {
        prompt: normalizedPrompt,
        dataUrl,
        svgMarkup,
        timestamp: createdAt,
        route: routeSegment,
      }

      const existingWithoutDuplicate = history.filter(
        (entry) => entry.dataUrl !== newEntry.dataUrl || entry.prompt !== newEntry.prompt,
      )
      const nextHistory = [newEntry, ...existingWithoutDuplicate].slice(0, SVG_HISTORY_COOKIE_LIMIT)
      setHistory(nextHistory)
      writeSvgHistory(nextHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error during SVG generation.')
    } finally {
      setLoading(false)
    }
  }

  function handleSelectHistory(entry) {
    if (!entry) return
    setPrompt(entry.prompt || '')
    setUseDeluxeRoute(entry.route === 'svg_deluxe')
    setResult({
      prompt: entry.prompt,
      dataUrl: computeDataUrl(entry),
      svgMarkup: entry.svgMarkup || '',
      raw: null,
      route: entry.route || 'svg',
    })
  }

  function handleClearHistory() {
    clearSvgHistory()
    setHistory([])
  }

  async function handleCopyMarkup() {
    if (!result?.svgMarkup) return
    try {
      await navigator.clipboard.writeText(result.svgMarkup)
      setCopied(true)
    } catch (err) {
      console.error('Failed to copy SVG markup', err)
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
        >
          <div>
            <label htmlFor="svglab-prompt" className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
              SVG prompt
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">/svg worker endpoint</span>
            </label>
            <textarea
              id="svglab-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Describe what the SVG should contain..."
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Requests are sent to{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.7rem] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {`${apiBaseUrl}/${routeSegment}/<prompt>`}
              </code>
              . We encode the prompt so spaces and punctuation are preserved.
            </p>
            <label
              htmlFor="svglab-deluxe"
              className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3 text-sm text-slate-600 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
            >
              <input
                id="svglab-deluxe"
                type="checkbox"
                checked={useDeluxeRoute}
                onChange={(event) => setUseDeluxeRoute(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900"
              />
              <span>
                Use the <code className="rounded bg-slate-200 px-1 py-0.5 text-[0.7rem] text-slate-700 dark:bg-slate-900 dark:text-slate-200">/svg_deluxe</code> route for{' '}
                oss-120B generations with an 8,192-token canvas suitable for animated SVGs.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-brand-400 dark:focus-visible:ring-offset-slate-900"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Generating…' : 'Generate SVG'}
            </button>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300 dark:focus-visible:ring-offset-slate-900"
              >
                <TrashIcon className="h-4 w-4" />
                Clear saved prompts
              </button>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
        </form>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Latest result
            </div>
            <div className="flex flex-col gap-4 p-4">
              {result ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">{result.prompt}</h3>
                    {result.svgMarkup ? (
                      <button
                        type="button"
                        onClick={handleCopyMarkup}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                        {copied ? 'Copied!' : 'Copy SVG'}
                      </button>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Served via {result.route === 'svg_deluxe' ? 'oss-120B' : 'Llama 3 70B'} on the{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.65rem] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      /{result.route || 'svg'}
                    </code>{' '}
                    endpoint.
                  </p>
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    <img src={result.dataUrl} alt={result.prompt} className="h-full w-full object-contain" loading="lazy" />
                  </div>
                  {result.raw ? (
                    <details className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
                      <summary className="cursor-pointer text-sm font-semibold">View raw response</summary>
                      <pre className="mt-2 whitespace-pre-wrap break-all text-[0.7rem] leading-relaxed">
                        {JSON.stringify(result.raw, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </>
              ) : (
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Submit a prompt to generate your first SVG. The rendered artwork will appear here.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              Saved prompts (cookie-based gallery)
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Generate an SVG to store the prompt and markup in a browser cookie. Up to {SVG_HISTORY_COOKIE_LIMIT} recent entries are saved for quick recall.
                </p>
              ) : (
                history.map((entry) => (
                  <HistoryItem key={`${entry.timestamp}-${entry.prompt}`} entry={entry} onSelect={handleSelectHistory} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
