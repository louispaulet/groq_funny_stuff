import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRemoteObject } from '../../lib/objectApi'

const TIMELINE_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['date', 'title', 'description'],
      },
      minItems: 3,
    },
    headline: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['events'],
}

const TIMELINE_SYSTEM_PROMPT = [
  'You are a structured timeline designer.',
  'Return a single JSON object that strictly matches the provided schema.',
  'Each event must be ordered chronologically and contain a short title, a concise ISO-friendly date label (YYYY-MM-DD or Month YYYY), and a vivid description limited to 2 sentences.',
  'Favor inclusive language, keep the tone energetic yet professional, and ensure the set spans the full duration implied by the request.',
  'Avoid markdown, bullet lists, or commentary outside the JSON response.',
].join(' ')

const PRESET_SCENARIOS = [
  {
    id: 'launch',
    label: 'Launch Runway',
    prompt:
      'Craft a 10-step launch timeline for unveiling a Groq-powered developer platform, starting with discovery and ending with a community retrospective.',
  },
  {
    id: 'conference',
    label: 'Summit Agenda',
    prompt:
      'Design a conference week timeline for a hybrid Groq innovation summit that includes travel, rehearsals, mainstage moments, and follow-up content drops.',
  },
  {
    id: 'onboarding',
    label: 'Onboarding Sprint',
    prompt:
      'Outline a four-week onboarding timeline for a new AI partnerships team member joining Groq, including mentorship checkpoints and demo day prep.',
  },
  {
    id: 'release',
    label: 'Release Cadence',
    prompt:
      'Map a quarterly release train timeline for iterative updates to a Groq dashboard, covering research, build, beta, launch, and feedback integration.',
  },
  {
    id: 'mission',
    label: 'Moonshot Mission',
    prompt:
      'Plot a narrative timeline for a year-long cross-functional moonshot that deploys Groq acceleration in clean energy analytics, from charter to measurable impact.',
  },
]

function sanitizeEvents(rawEvents) {
  if (!Array.isArray(rawEvents)) return []
  return rawEvents
    .map((event, index) => ({
      id: `timeline-event-${index}`,
      date: typeof event?.date === 'string' ? event.date.trim() : '',
      title: typeof event?.title === 'string' ? event.title.trim() : '',
      description:
        typeof event?.description === 'string' ? event.description.trim() : '',
    }))
    .filter((event) => event.date || event.title || event.description)
}

function TimelineSkeleton() {
  return Array.from({ length: 4 }).map((_, index) => (
    <li key={index} className="animate-pulse space-y-2">
      <div className="flex items-start gap-4">
        <span className="mt-1 block h-2 w-2 rounded-full bg-white/40" aria-hidden />
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="h-3 w-24 rounded-full bg-white/30" aria-hidden />
          <div className="h-4 w-40 rounded-full bg-white/20" aria-hidden />
          <div className="h-16 w-full rounded-2xl bg-white/10" aria-hidden />
        </div>
      </div>
    </li>
  ))
}

export default function TimelineShowcase() {
  const [prompt, setPrompt] = useState(PRESET_SCENARIOS[0].prompt)
  const [events, setEvents] = useState([])
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [loading, setLoading] = useState(false)
  const [activeScenarioId, setActiveScenarioId] = useState(PRESET_SCENARIOS[0].id)

  const activeRequestRef = useRef(0)

  const orderedEvents = useMemo(() => {
    const items = sanitizeEvents(events)
    return items
  }, [events])

  const runTimelineRequest = useCallback(async (inputPrompt, { triggeredByScenario = false } = {}) => {
    const trimmedPrompt = (inputPrompt || '').trim()
    if (!trimmedPrompt) {
      setStatus({ type: 'error', message: 'Describe the timeline you want before calling /obj.' })
      return
    }

    const requestId = Date.now()
    activeRequestRef.current = requestId
    setLoading(true)
    setStatus({
      type: 'info',
      message: triggeredByScenario
        ? 'Loading preset timeline via /obj…'
        : 'Assembling your custom timeline via /obj…',
    })

    try {
      const composedPrompt = [
        'Create a chronological timeline with vivid yet concise event descriptions.',
        'The request is:',
        trimmedPrompt,
      ].join(' ')

      const { payload } = await createRemoteObject({
        structure: TIMELINE_STRUCTURE,
        objectType: 'timeline',
        prompt: composedPrompt,
        system: TIMELINE_SYSTEM_PROMPT,
        strict: true,
      })

      if (activeRequestRef.current !== requestId) {
        return
      }

      const nextEvents = sanitizeEvents(payload?.events || payload?.timeline || [])
      if (!nextEvents.length) {
        throw new Error('Timeline missing from /obj response.')
      }

      setEvents(nextEvents)
      setHeadline(
        typeof payload?.headline === 'string' && payload.headline.trim()
          ? payload.headline.trim()
          : ''
      )
      setSummary(
        typeof payload?.summary === 'string' && payload.summary.trim()
          ? payload.summary.trim()
          : ''
      )
      setStatus({
        type: 'success',
        message: 'Timeline generated via /obj. Scroll to explore each moment.',
      })
    } catch (error) {
      if (activeRequestRef.current !== requestId) {
        return
      }
      const baseMessage =
        error && typeof error.message === 'string'
          ? error.message
          : 'Timeline generation failed. Please try a different description.'
      setStatus({ type: 'error', message: baseMessage })
    } finally {
      if (activeRequestRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    runTimelineRequest(PRESET_SCENARIOS[0].prompt, { triggeredByScenario: true })
  }, [runTimelineRequest])

  const handleScenarioClick = async (scenario) => {
    setPrompt(scenario.prompt)
    setActiveScenarioId(scenario.id)
    await runTimelineRequest(scenario.prompt, { triggeredByScenario: true })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setActiveScenarioId('custom')
    await runTimelineRequest(prompt, { triggeredByScenario: false })
  }

  return (
    <section
      id="timeline-lab"
      className="relative scroll-mt-32 overflow-hidden rounded-[2.75rem] border border-violet-200 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-600 px-6 py-9 text-white shadow-xl transition hover:shadow-2xl dark:border-violet-800 sm:px-10 sm:py-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" aria-hidden />
      <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/90">
              🗓️ Timeline Atelier
            </p>
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl">Scroll a living story arc</h2>
            <p className="max-w-xl text-sm text-white/90">
              Pick a preset or write your own prompt. We will ask the <code className="rounded bg-white/20 px-1 py-0.5 text-[0.7rem] font-semibold text-white">/obj</code> worker for structured events—each with a date, title, and description—then lay them out in a cascading timeline.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioClick(scenario)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:ring-white/80 ${
                  activeScenarioId === scenario.id
                    ? 'border-white bg-white/20 text-white shadow-lg'
                    : 'border-white/40 bg-white/10 text-white/80 hover:border-white/60 hover:bg-white/15 hover:text-white'
                }`}
              >
                {scenario.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Custom timeline brief
            </label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder="Describe the sequence you want to explore…"
              className="w-full rounded-2xl border border-white/30 bg-white/10 p-4 text-sm text-white placeholder-white/60 shadow-inner transition focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-violet-700 shadow-lg transition hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-700 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {loading ? 'Generating…' : 'Generate timeline'}
                <span aria-hidden>{loading ? '…' : '→'}</span>
              </button>
              <span className="rounded-full border border-dashed border-white/40 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-white/80">
                Chronological · Scrollable
              </span>
            </div>
            <p
              role="status"
              aria-live="polite"
              className={`text-xs ${
              status.type === 'error'
                ? 'text-rose-100'
                : status.type === 'success'
                  ? 'text-emerald-100'
                  : 'text-white/80'
            }`}
            >
              {status.message}
            </p>
          </form>
        </div>

        <div className="relative">
          <div className="absolute -right-20 -top-20 h-36 w-36 rounded-full bg-white/30 blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,_rgba(255,255,255,0.12),_transparent_55%)]" aria-hidden />
            <div className="relative z-10 space-y-5">
              {headline ? (
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">{headline}</h3>
                  {summary ? (
                    <p className="text-sm text-white/80">{summary}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="relative max-h-[26rem] overflow-y-auto pr-4">
                <div className="absolute left-[0.45rem] top-0 bottom-0 w-px bg-gradient-to-b from-white/40 via-white/20 to-transparent" aria-hidden />
                <ol className="space-y-6">
                  {loading && !orderedEvents.length ? (
                    <TimelineSkeleton />
                  ) : (
                    orderedEvents.map((event) => (
                      <li key={event.id} className="relative pl-6">
                        <span className="absolute left-0 top-1.5 block h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-white/80 bg-gradient-to-br from-white via-fuchsia-100 to-violet-200 shadow-[0_0_12px_rgba(255,255,255,0.6)]" aria-hidden />
                        <div className="space-y-1 rounded-2xl border border-white/20 bg-white/10 p-4 shadow-inner">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70">
                            {event.date || 'Date forthcoming'}
                          </p>
                          <h4 className="text-base font-semibold text-white">{event.title || 'Untitled milestone'}</h4>
                          <p className="text-sm leading-relaxed text-white/90">{event.description || 'Description pending.'}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
