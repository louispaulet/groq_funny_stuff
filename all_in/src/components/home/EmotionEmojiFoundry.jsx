import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const LOAD_INTERVAL_MS = 5000
const DEFAULT_BASE_URL = 'https://groq-endpoint.louispaulet13.workers.dev'

const EMOTIONS = [
  {
    id: 'joy',
    name: 'Joy',
    referenceEmoji: '😊',
    description: 'Bright, uplifting energy and a wide smile.',
    promptDetail: 'glowing cheeks and a cheerful grin',
  },
  {
    id: 'sadness',
    name: 'Sadness',
    referenceEmoji: '😢',
    description: 'Soft tears and a gentle frown to show sorrow.',
    promptDetail: 'a single tear and a trembling mouth',
  },
  {
    id: 'anger',
    name: 'Anger',
    referenceEmoji: '😠',
    description: 'Furrowed brows and heat-filled cheeks.',
    promptDetail: 'furrowed brows and a fiery scowl',
  },
  {
    id: 'fear',
    name: 'Fear',
    referenceEmoji: '😨',
    description: 'Wide eyes and a shaky expression.',
    promptDetail: 'wide eyes and a quivering mouth',
  },
  {
    id: 'surprise',
    name: 'Surprise',
    referenceEmoji: '😮',
    description: 'Open mouth awe with lifted brows.',
    promptDetail: 'lifted brows and an open mouth',
  },
  {
    id: 'disgust',
    name: 'Disgust',
    referenceEmoji: '🤢',
    description: 'Wrinkled nose and a scrunched expression.',
    promptDetail: 'a wrinkled nose and queasy eyes',
  },
  {
    id: 'love',
    name: 'Love',
    referenceEmoji: '😍',
    description: 'Heart-filled gaze with soft blush.',
    promptDetail: 'heart-shaped eyes and a gentle smile',
  },
]

const isTestEnvironment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'

const buildDataUrl = (payload) => {
  const inline = typeof payload?.dataUrl === 'string' ? payload.dataUrl.trim() : ''
  if (inline.startsWith('data:image/svg+xml')) return inline
  const svgMarkup = typeof payload?.svg === 'string' ? payload.svg.trim() : ''
  return svgMarkup ? `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}` : ''
}

const createEmotionEntry = (emotion) => ({
  emotion,
  status: 'idle',
  prompt: '',
  dataUrl: '',
  error: '',
})

function EmotionEmojiCard({ entry }) {
  const { emotion, dataUrl, error, prompt, status } = entry
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/60">
      <header className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-2xl dark:bg-amber-500/20" aria-hidden>
          {emotion.referenceEmoji}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{emotion.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{emotion.description}</p>
        </div>
      </header>
      <div className="overflow-hidden rounded-xl border border-brand-200 bg-white p-2 text-center dark:border-brand-500/60 dark:bg-slate-900">
        {dataUrl ? (
          <img src={dataUrl} alt={`Generated ${emotion.name.toLowerCase()} emoji`} className="mx-auto h-24 w-24 object-contain" loading="lazy" />
        ) : (
          <div className="flex h-24 items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
            {status === 'error'
              ? 'Generation failed'
              : status === 'loading'
                ? 'Designing emoji…'
                : 'Pending request'}
          </div>
        )}
      </div>
      <footer className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <p className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {prompt || `Waiting to request the ${emotion.name.toLowerCase()} emoji…`}
        </p>
        {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : null}
      </footer>
    </article>
  )
}

export default function EmotionEmojiFoundry({ svgApiBaseUrl }) {
  const [entries, setEntries] = useState(() => EMOTIONS.map(createEmotionEntry))
  const [generationState, setGenerationState] = useState({ running: false, completed: false })

  const apiBaseUrl = useMemo(() => {
    const base = (svgApiBaseUrl || DEFAULT_BASE_URL || '').replace(/\/$/, '')
    return base || DEFAULT_BASE_URL
  }, [svgApiBaseUrl])

  const timeoutsRef = useRef()
  const cancelledRef = useRef(false)
  const generationStateRef = useRef(generationState)

  const setTrackedGenerationState = useCallback((updater) => {
    setGenerationState((previous) => {
      const nextState = typeof updater === 'function' ? updater(previous) : updater
      generationStateRef.current = nextState
      return nextState
    })
  }, [])

  const updateEntry = useCallback((index, patch) => {
    setEntries((previous) =>
      previous.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
    )
  }, [])

  const runGenerationStep = useCallback(
    (index) => {
      if (cancelledRef.current) return
      if (index >= EMOTIONS.length) {
        setTrackedGenerationState({ running: false, completed: true })
        timeoutsRef.current = undefined
        return
      }

      const emotion = EMOTIONS[index]
      const requestPrompt = [
        `Create a single emoji-style SVG icon that expresses ${emotion.name.toLowerCase()}.`,
        'Use a circular face, bold readable features, and a clean background.',
        `Emphasize ${emotion.promptDetail}.`,
        'Return only the SVG markup.',
      ].join(' ')

      updateEntry(index, { status: 'loading', prompt: requestPrompt, error: '', dataUrl: '' })

      ;(async () => {
        try {
          const requestUrl = new URL(`${apiBaseUrl}/svg_deluxe/${encodeURIComponent(requestPrompt)}`)
          const response = await fetch(requestUrl.toString())
          if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
          const payload = await response.json()
          const dataUrl = buildDataUrl(payload)
          if (!dataUrl) throw new Error('The response did not include SVG markup.')

          updateEntry(index, {
            status: 'done',
            dataUrl,
            prompt:
              typeof payload?.prompt === 'string' && payload.prompt.trim()
                ? payload.prompt.trim()
                : requestPrompt,
          })
        } catch (error) {
          updateEntry(index, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unexpected error while generating the emoji.',
          })
        } finally {
          if (!cancelledRef.current) {
            timeoutsRef.current = setTimeout(() => runGenerationStep(index + 1), LOAD_INTERVAL_MS)
          }
        }
      })()
    },
    [apiBaseUrl, updateEntry, setTrackedGenerationState],
  )

  const startGeneration = useCallback(
    ({ force = false } = {}) => {
      if (generationStateRef.current.running && !force) return
      cancelledRef.current = false

      setEntries(EMOTIONS.map(createEmotionEntry))
      setTrackedGenerationState({ running: true, completed: false })

      if (timeoutsRef.current) clearTimeout(timeoutsRef.current)

      timeoutsRef.current = setTimeout(() => runGenerationStep(0), 200)
    },
    [runGenerationStep, setTrackedGenerationState],
  )

  useEffect(() => {
    cancelledRef.current = false
    if (!isTestEnvironment) {
      startGeneration()
    }

    return () => {
      cancelledRef.current = true
      if (timeoutsRef.current) clearTimeout(timeoutsRef.current)
    }
  }, [startGeneration])

  const { running, completed } = generationState
  const statusLabel = running ? 'Running sequence…' : completed ? 'Completed — tap regenerate to refresh.' : 'Idle — tap regenerate to begin.'

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/20 via-pink-500/15 to-transparent" aria-hidden />
        <div className="relative space-y-6">
          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Emoji assembly line</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Emotion Emoji Foundry</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Queue seven foundational emotions through the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/svg_deluxe</code>{' '}
              route. Each prompt streams an expressive emoji at a five-second cadence so the free tier stays happy.
            </p>
          </header>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => startGeneration({ force: true })}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-amber-500/60"
              disabled={running}
            >
              Regenerate sequence
              <span aria-hidden>↻</span>
            </button>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-600 dark:text-amber-300">{statusLabel}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Requests sleep for five seconds between calls to respect rate limits.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {entries.map((entry) => (
              <EmotionEmojiCard key={entry.emotion.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
