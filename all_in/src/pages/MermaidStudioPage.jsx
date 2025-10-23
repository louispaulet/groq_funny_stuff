import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import { ArrowPathIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline'
import {
  appendMermaidHistoryEntry,
  clearMermaidHistory,
  readMermaidHistory,
  MERMAID_HISTORY_LIMIT,
} from '../lib/mermaidHistoryCookie'

const SANITIZER_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
}

function buildPreviewMarkup(svgMarkup) {
  if (typeof window === 'undefined') return ''
  if (typeof svgMarkup !== 'string') return ''
  const trimmed = svgMarkup.trim()
  if (!trimmed) return ''
  return DOMPurify.sanitize(trimmed, SANITIZER_CONFIG)
}

function GalleryItem({ entry, onSelect }) {
  const sanitizedMarkup = useMemo(() => buildPreviewMarkup(entry.svgMarkup), [entry.svgMarkup])

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-slate-200 bg-white/80 p-3 text-left shadow-sm transition hover:border-brand-400 hover:bg-brand-50/70 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-300"
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
        {sanitizedMarkup ? (
          <div
            className="h-full w-full origin-top-left scale-90 transform text-slate-900 dark:text-slate-100"
            dangerouslySetInnerHTML={{ __html: sanitizedMarkup }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-slate-400 dark:text-slate-500">
            Preview unavailable
          </div>
        )}
      </div>
      <div>
        <p className="line-clamp-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {entry.prompt || 'Saved Mermaid prompt'}
        </p>
        {entry.timestamp ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        ) : null}
      </div>
    </button>
  )
}

export default function MermaidStudioPage() {
  const [prompt, setPrompt] = useState('graph TD\n  Start([Prompt received]) --> Validate{Valid Mermaid?}\n  Validate -- Yes --> Render[Render diagram]\n  Validate -- No --> Fix[Revise syntax]\n  Render --> Gallery[Store previous render]')
  const [diagram, setDiagram] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [rendering, setRendering] = useState(false)

  const renderCounter = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'neutral' })
  }, [])

  useEffect(() => {
    setHistory(readMermaidHistory())
  }, [])

  const sanitizedDiagram = useMemo(() => buildPreviewMarkup(diagram?.svgMarkup || ''), [diagram?.svgMarkup])

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setStatus({ type: 'error', message: 'Enter a Mermaid definition to render.' })
      return
    }

    if (typeof window === 'undefined') {
      setStatus({ type: 'error', message: 'Mermaid is not available in this environment.' })
      return
    }

    const previousDiagram = diagram
    const promptChanged = previousDiagram && previousDiagram.prompt !== trimmedPrompt

    if (promptChanged) {
      setDiagram(null)
    }

    setRendering(true)
    setStatus(null)

    try {
      renderCounter.current += 1
      const renderId = `mermaid-diagram-${renderCounter.current}`
      const { svg } = await mermaid.render(renderId, trimmedPrompt)

      if (promptChanged) {
        const nextHistory = appendMermaidHistoryEntry(previousDiagram)
        setHistory(nextHistory)
      }

      setDiagram({ prompt: trimmedPrompt, svgMarkup: svg })
      setStatus({ type: 'success', message: 'Diagram rendered. Tweak the prompt to explore variants.' })
    } catch (error) {
      const message =
        error && typeof error.message === 'string'
          ? `Mermaid render failed: ${error.message}`
          : 'Mermaid render failed. Please check your syntax.'
      setStatus({ type: 'error', message })
      if (promptChanged && previousDiagram) {
        setDiagram(previousDiagram)
      }
    } finally {
      setRendering(false)
    }
  }

  function handleClearCurrent() {
    setDiagram(null)
    setPrompt('')
    setStatus({ type: 'info', message: 'Cleared the current prompt and diagram. Your gallery remains intact.' })
  }

  function handleSelectHistory(entry) {
    if (!entry) return
    setPrompt(entry.prompt || '')
    setDiagram({ prompt: entry.prompt || '', svgMarkup: entry.svgMarkup })
    setStatus({ type: 'info', message: 'Loaded a saved Mermaid render. Adjust and submit to remix it.' })
  }

  function handleClearHistory() {
    clearMermaidHistory()
    setHistory([])
    setStatus({ type: 'info', message: 'Cleared the Mermaid gallery cookie for this browser.' })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="mermaid-prompt" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Prompt Mermaid to sketch a flow
            </label>
            <input
              id="mermaid-prompt"
              type="text"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: graph TD; Start --> Decision{Go this way?}; Decision -->|Yes| PathA; Decision -->|No| PathB"
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={rendering}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Press Enter or hit render to update the diagram. Submitting a new prompt moves the previous render into the gallery.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-400"
              disabled={rendering}
            >
              {rendering ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
              <span>{rendering ? 'Rendering…' : 'Render diagram'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearCurrent}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </form>
        {status ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              status.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200'
                : status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                  : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
            }`}
          >
            {status.message}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Live Mermaid canvas</h2>
          {diagram?.prompt ? (
            <span className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">{diagram.prompt}</span>
          ) : null}
        </div>
        <div className="relative min-h-[16rem] overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          {rendering ? (
            <div className="absolute inset-0 grid place-items-center">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Rendering Mermaid diagram…</span>
              </div>
            </div>
          ) : null}
          {sanitizedDiagram ? (
            <div className={`transition-opacity ${rendering ? 'opacity-0' : 'opacity-100'}`}>
              <div
                className="mermaid-diagram w-full text-slate-900 dark:text-slate-100"
                dangerouslySetInnerHTML={{ __html: sanitizedDiagram }}
              />
            </div>
          ) : (
            !rendering && (
              <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                No diagram rendered yet. Add a prompt above to see Mermaid in action.
              </div>
            )
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Mermaid gallery</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Each new render archives the previous diagram here. The gallery keeps up to {MERMAID_HISTORY_LIMIT} diagrams per browser.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearHistory}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-400 dark:hover:text-red-300"
          >
            Clear gallery cookie
          </button>
        </div>
        {history.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {history.map((entry) => (
              <GalleryItem key={`${entry.timestamp}-${entry.prompt}`} entry={entry} onSelect={handleSelectHistory} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            Render a diagram to start building your Mermaid gallery. Every submission tucks the previous render here for safekeeping.
          </div>
        )}
      </section>
    </div>
  )
}
