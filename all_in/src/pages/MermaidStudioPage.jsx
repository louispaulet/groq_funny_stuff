import { useEffect, useMemo, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import { ArrowPathIcon, ClipboardDocumentIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { createRemoteObject } from '../lib/objectApi'
import { normalizeBaseUrl } from '../lib/objectMakerUtils'
import {
  appendMermaidHistoryEntry,
  clearMermaidHistory,
  readMermaidHistory,
  MERMAID_HISTORY_LIMIT,
} from '../lib/mermaidHistoryCookie'

const SANITIZER_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['foreignObject', 'div', 'span', 'p', 'style', 'br', 'switch', 'tspan'],
  ADD_ATTR: [
    'class',
    'style',
    'id',
    'data-background',
    'data-mermaid-enhanced',
    'data-mermaid-text-style',
    'dominant-baseline',
    'alignment-baseline',
    'baseline-shift',
    'text-anchor',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'marker-start',
    'marker-mid',
    'marker-end',
    'transform',
    'fill',
    'stroke',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-dasharray',
    'stroke-dashoffset',
    'opacity',
    'viewBox',
    'width',
    'height',
    'x',
    'y',
    'dx',
    'dy',
    'rx',
    'ry',
    'cx',
    'cy',
    'r',
    'd',
    'points',
    'xmlns',
    'xmlns:xlink',
    'xml:space',
    'xlink:href',
  ],
  KEEP_CONTENT: true,
}

const MERMAID_RESPONSE_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'Short label for the generated diagram.',
    },
    mermaid: {
      type: 'string',
      description: 'Valid Mermaid definition (no code fences).',
    },
    notes: {
      type: 'string',
      description: 'Optional summary or assumptions about the diagram.',
    },
  },
  required: ['mermaid'],
}

const MERMAID_OBJECT_TYPE = 'mermaid_blueprint'

const MERMAID_SYSTEM_PROMPT = [
  'You are a diagram director who produces Mermaid.js diagrams from natural language briefs.',
  'Return a JSON object that follows the provided schema.',
  'The "mermaid" field must contain a valid Mermaid definition that renders in Mermaid v10 without modifications. Do not include code fences or commentary.',
  'Choose the most appropriate diagram style (flowchart, sequence, class, timeline, mindmap, etc.) for the request and use concise, descriptive labels.',
  'Keep identifiers syntax-safe and prefer multi-line layouts when relationships need clarity.',
  'Capture any assumptions or guidance for the user in the optional "notes" field (keep it under 100 words).',
  'Every node must include a clear, human-readable label that names the entity (such as a character or system component).',
  'Provide short edge labels (e.g., “mentors”, “reports to”) whenever it clarifies the relationship between nodes.',
].join(' ')

function buildPreviewMarkup(svgMarkup) {
  if (typeof window === 'undefined') return ''
  if (typeof svgMarkup !== 'string') return ''
  const trimmed = svgMarkup.trim()
  if (!trimmed) return ''
  return DOMPurify.sanitize(trimmed, SANITIZER_CONFIG)
}

function buildObjectPrompt(userPrompt) {
  return [
    'Create a Mermaid.js diagram that satisfies the following request.',
    'Respond with a JSON object matching the provided schema.',
    'Use newline characters to format the diagram for readability.',
    '',
    'User brief:',
    userPrompt,
  ].join('\n')
}

const MERMAID_TEXT_STYLE = `<style data-mermaid-text-style>
[data-mermaid-enhanced="true"] .nodeLabel,
[data-mermaid-enhanced="true"] .label,
[data-mermaid-enhanced="true"] foreignObject div {
  color: #1f2937 !important;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
}
[data-mermaid-enhanced="true"] .edgeLabel,
[data-mermaid-enhanced="true"] .edgeLabel tspan {
  fill: #1f2937 !important;
  color: #1f2937 !important;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(15, 23, 42, 0.08);
}
[data-mermaid-enhanced="true"] .edgeLabel rect {
  fill: rgba(226, 232, 240, 0.95);
  stroke: rgba(148, 163, 184, 0.65);
  stroke-width: 0.6;
}
[data-mermaid-enhanced="true"] .label text,
[data-mermaid-enhanced="true"] .nodeLabel text {
  fill: #1f2937 !important;
}
[data-mermaid-enhanced="true"] .label foreignObject {
  overflow: visible;
}
</style>`

function decorateMermaidSvg(svgMarkup) {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) return ''
  let enhanced = svgMarkup
  if (!enhanced.includes('data-mermaid-enhanced')) {
    enhanced = enhanced.replace(/<svg\b/, (match) => `${match} data-mermaid-enhanced="true"`)
  }
  if (!enhanced.includes('data-mermaid-text-style')) {
    enhanced = enhanced.replace(/<svg\b[^>]*>/, (match) => `${match}${MERMAID_TEXT_STYLE}`)
  }
  return enhanced
}

function GalleryItem({ entry, onSelect }) {
  const sanitizedMarkup = useMemo(() => buildPreviewMarkup(entry.svgMarkup), [entry.svgMarkup])
  const title = entry.title || 'Saved Mermaid diagram'
  const brief = entry.prompt

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
      <div className="space-y-1">
        <p className="line-clamp-1 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
        {brief ? <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">“{brief}”</p> : null}
        {entry.timestamp ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        ) : null}
      </div>
    </button>
  )
}

export default function MermaidStudioPage({ experience }) {
  const [prompt, setPrompt] = useState('Show the interactions of The Office characters.')
  const [diagram, setDiagram] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [rendering, setRendering] = useState(false)
  const [copied, setCopied] = useState(false)

  const renderCounter = useRef(0)

  const normalizedBaseUrl = normalizeBaseUrl(experience?.defaultBaseUrl)
  const model = experience?.defaultModel || experience?.modelOptions?.[0] || ''

  useEffect(() => {
    if (typeof window === 'undefined') return
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'neutral',
      flowchart: { useMaxWidth: false, htmlLabels: false, curve: 'basis' },
      themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        textColor: '#1f2937',
        primaryTextColor: '#1f2937',
        secondaryTextColor: '#1f2937',
        nodeTextColor: '#1f2937',
        labelTextColor: '#1f2937',
        primaryColor: '#f8fafc',
        secondaryColor: '#e2e8f0',
        tertiaryColor: '#cbd5f5',
        lineColor: '#64748b',
        edgeLabelBackground: '#e2e8f0',
        edgeLabelTextColor: '#1f2937',
      },
    })
  }, [])

  useEffect(() => {
    setHistory(readMermaidHistory())
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const sanitizedDiagram = useMemo(() => buildPreviewMarkup(diagram?.svgMarkup || ''), [diagram?.svgMarkup])
  const mermaidSource = diagram?.mermaidSource || ''
  const diagramTitle = diagram?.title || ''
  const diagramNotes = diagram?.notes || ''

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setStatus({ type: 'error', message: 'Describe the diagram you want before calling /obj.' })
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
    setCopied(false)
    setStatus({ type: 'info', message: 'Drafting Mermaid markup via /obj…' })

    let mermaidText = ''
    let title = ''
    let notes = ''

    try {
      const { payload } = await createRemoteObject({
        baseUrl: normalizedBaseUrl || undefined,
        structure: MERMAID_RESPONSE_STRUCTURE,
        objectType: MERMAID_OBJECT_TYPE,
        prompt: buildObjectPrompt(trimmedPrompt),
        system: MERMAID_SYSTEM_PROMPT,
        strict: true,
        model: model || undefined,
      })

      mermaidText = typeof payload?.mermaid === 'string' ? payload.mermaid.trim() : ''
      title = typeof payload?.title === 'string' ? payload.title.trim() : ''
      notes = typeof payload?.notes === 'string' ? payload.notes.trim() : ''

      if (!mermaidText) {
        throw new Error('Mermaid diagram missing from /obj response.')
      }

      renderCounter.current += 1
      const renderId = `mermaid-diagram-${renderCounter.current}`
      const { svg } = await mermaid.render(renderId, mermaidText)
      const decoratedSvg = decorateMermaidSvg(svg)

      if (promptChanged && previousDiagram) {
        const nextHistory = appendMermaidHistoryEntry(previousDiagram)
        setHistory(nextHistory)
      }

      setDiagram({
        prompt: trimmedPrompt,
        mermaidSource: mermaidText,
        svgMarkup: decoratedSvg,
        title,
        notes,
      })
      setStatus({
        type: 'success',
        message: 'Mermaid diagram generated via /obj. Copy the source or iterate with another brief.',
      })
    } catch (error) {
      const baseMessage =
        error && typeof error.message === 'string'
          ? error.message
          : 'Mermaid generation failed. Please try a different description.'
      if (mermaidText) {
        setDiagram({
          prompt: trimmedPrompt,
          mermaidSource: mermaidText,
          svgMarkup: '',
          title,
          notes,
        })
        setStatus({
          type: 'error',
          message: `Mermaid render failed: ${baseMessage}. Copy the generated source below or adjust your prompt.`,
        })
      } else {
        if (promptChanged && previousDiagram) {
          setDiagram(previousDiagram)
        }
        setStatus({ type: 'error', message: baseMessage })
      }
    } finally {
      setRendering(false)
    }
  }

  function handleCopySource() {
    if (!mermaidSource) return
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(mermaidSource)
        .then(() => setCopied(true))
        .catch(() => {
          setStatus({
            type: 'error',
            message: 'Copy failed. Select the Mermaid source manually instead.',
          })
        })
    } else {
      setStatus({
        type: 'error',
        message: 'Clipboard API unavailable. Select the Mermaid source manually instead.',
      })
    }
  }

  function handleClearCurrent() {
    setDiagram(null)
    setPrompt('')
    setStatus({ type: 'info', message: 'Cleared the current brief and diagram. Your gallery remains intact.' })
    setCopied(false)
  }

  function handleSelectHistory(entry) {
    if (!entry) return
    setPrompt(entry.prompt || '')
    setDiagram({
      prompt: entry.prompt || '',
      svgMarkup: entry.svgMarkup,
      mermaidSource: entry.mermaidSource || '',
      title: entry.title || '',
      notes: entry.notes || '',
    })
    setStatus({ type: 'info', message: 'Loaded a saved Mermaid render. Submit to regenerate it via /obj.' })
    setCopied(false)
  }

  function handleClearHistory() {
    clearMermaidHistory()
    setHistory([])
    setStatus({ type: 'info', message: 'Cleared the Mermaid gallery cookie for this browser.' })
  }

  const promptPlaceholder =
    experience?.promptPlaceholder || 'Example: Show the interactions of The Office characters.'

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="mermaid-prompt" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Describe the diagram you need
            </label>
            <textarea
              id="mermaid-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={promptPlaceholder}
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              disabled={rendering}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              We send your brief to the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code>{' '}
              helper so the LLM returns a ready-to-render Mermaid definition.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:bg-brand-400"
              disabled={rendering}
            >
              {rendering ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <PlayIcon className="h-4 w-4" />}
              <span>{rendering ? 'Drafting…' : 'Generate diagram'}</span>
            </button>
            <button
              type="button"
              onClick={handleClearCurrent}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Clear</span>
            </button>
            {model ? (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Powered by <span className="font-medium text-slate-700 dark:text-slate-200">{model}</span> via /obj
              </span>
            ) : null}
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

      {mermaidSource ? (
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Generated Mermaid source</h2>
              {diagramTitle ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{diagramTitle}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleCopySource}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-300 dark:hover:text-brand-200"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy source'}</span>
            </button>
          </div>
          <textarea
            value={mermaidSource}
            readOnly
            spellCheck={false}
            className="h-48 w-full rounded-2xl border border-slate-300 bg-slate-950/5 px-4 py-3 text-xs font-mono text-slate-700 shadow-inner transition dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-100"
          />
          {diagramNotes ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{diagramNotes}</p>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Live Mermaid canvas</h2>
            {diagramTitle ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">{diagramTitle}</p>
            ) : null}
          </div>
          {diagram?.prompt ? (
            <span className="max-w-xs text-right text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {diagram.prompt}
            </span>
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
                No diagram rendered yet. Describe a scene above to see Mermaid in action.
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
            Generate a diagram to start building your Mermaid gallery. Every submission tucks the previous render here for safekeeping.
          </div>
        )}
      </section>
    </div>
  )
}
