import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExperienceById } from '../config/experiences'
import { createRemoteObject } from '../lib/objectApi'
import { normalizeBaseUrl } from '../lib/objectMakerUtils'
import {
  TIMELINE_OBJECT_TYPE,
  TIMELINE_PRESET_SCENARIOS,
  TIMELINE_RESPONSE_STRUCTURE,
  TIMELINE_SYSTEM_PROMPT,
  buildTimelinePrompt,
} from '../lib/timelineStudio'

const FALLBACK_PROMPT = TIMELINE_PRESET_SCENARIOS[0]?.prompt || ''

function StatusBanner({ status }) {
  if (!status) return null
  const tone =
    status.type === 'error'
      ? 'border-rose-300 bg-rose-50/90 text-rose-800 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-100'
      : status.type === 'success'
        ? 'border-emerald-300 bg-emerald-50/90 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100'
        : 'border-slate-300 bg-white/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200'
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm shadow-sm backdrop-blur transition ${tone}`}
      role={status.type === 'error' ? 'alert' : 'status'}
    >
      {status.message}
    </div>
  )
}

function ScenarioButtons({ activeScenarioId, loading, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TIMELINE_PRESET_SCENARIOS.map((scenario) => {
        const isActive = activeScenarioId === scenario.id
        return (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onSelect(scenario)}
            disabled={loading && !isActive}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed dark:focus-visible:ring-offset-slate-900 ${
              isActive
                ? 'border-transparent bg-gradient-to-r from-brand-500 via-purple-500 to-sky-500 text-white shadow'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:border-brand-400/60 hover:bg-brand-500/10 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
            }`}
          >
            <span>{scenario.label}</span>
            {isActive && loading ? (
              <span className="text-xs font-medium uppercase tracking-wide">Drafting…</span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function formatTimelineDate(value) {
  if (!value) return ''
  const trimmed = value.trim()
  const isoMatch = trimmed.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/)
  if (isoMatch) {
    const [year, month, day] = [isoMatch[1], isoMatch[2], isoMatch[3]]
    if (!month) return year
    const date = new Date(`${year}-${month || '01'}-${day || '01'}T00:00:00Z`)
    if (Number.isNaN(date.getTime())) return trimmed
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: day ? 'numeric' : undefined,
      timeZone: 'UTC',
    })
    return formatter.format(date)
  }
  const parsed = Date.parse(trimmed)
  if (!Number.isNaN(parsed)) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    return formatter.format(new Date(parsed))
  }
  return trimmed
}

function TimelineEventCard({ event, isLast }) {
  const dateLabel = formatTimelineDate(event.date || '')
  return (
    <li className="relative pl-10">
      <span
        className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-lg shadow-sm ${
          isLast
            ? 'border-brand-400 bg-brand-500 text-white'
            : 'border-white bg-white text-brand-500 shadow-md dark:border-slate-700 dark:bg-slate-800/80'
        }`}
        aria-hidden
      >
        {event.icon ? event.icon : '✦'}
      </span>
      {!isLast ? (
        <span className="absolute left-[13px] top-7 h-full w-[3px] bg-gradient-to-b from-brand-400 via-transparent to-transparent" aria-hidden />
      ) : null}
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-brand-300/80 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">{dateLabel}</p>
          {event.location ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{event.location}</p>
          ) : null}
        </div>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{event.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
      </div>
    </li>
  )
}

function TimelineRail({ events }) {
  if (!events?.length) {
    return (
      <div className="grid place-items-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        <p className="text-sm">No events yet. Choose a scenario or submit your own timeline brief.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-8">
      <span className="absolute left-[22px] top-0 h-full w-[2px] bg-gradient-to-b from-brand-300 via-brand-500/40 to-transparent" aria-hidden />
      {events.map((event, index) => (
        <TimelineEventCard key={`${event.date}-${event.title}-${index}`} event={event} isLast={index === events.length - 1} />
      ))}
    </ol>
  )
}

export default function TimelineStudioPage() {
  const objectMaker = getExperienceById('objectmaker')
  const normalizedBaseUrl = normalizeBaseUrl(objectMaker?.defaultBaseUrl)
  const model = objectMaker?.defaultModel || objectMaker?.modelOptions?.[0] || ''

  const [prompt, setPrompt] = useState(FALLBACK_PROMPT)
  const [timeline, setTimeline] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeScenarioId, setActiveScenarioId] = useState(TIMELINE_PRESET_SCENARIOS[0]?.id || null)
  const [autoInitialized, setAutoInitialized] = useState(false)

  const timelineMetadata = useMemo(() => {
    if (!timeline || typeof timeline !== 'object') {
      return { events: [], headline: '', summary: '', cta: null }
    }
    const events = Array.isArray(timeline.events)
      ? timeline.events
          .map((event) => ({
            date: typeof event?.date === 'string' ? event.date : '',
            title: typeof event?.title === 'string' ? event.title : 'Untitled moment',
            description: typeof event?.description === 'string' ? event.description : '',
            icon: typeof event?.icon === 'string' ? event.icon : '',
            location: typeof event?.location === 'string' ? event.location : '',
          }))
          .filter((event) => event.title && event.description)
      : []
    return {
      events,
      headline: typeof timeline.headline === 'string' ? timeline.headline.trim() : '',
      summary: typeof timeline.summary === 'string' ? timeline.summary.trim() : '',
      cta:
        timeline.cta && typeof timeline.cta === 'object'
          ? {
              label: typeof timeline.cta.label === 'string' ? timeline.cta.label.trim() : '',
              url: typeof timeline.cta.url === 'string' ? timeline.cta.url.trim() : '',
            }
          : null,
    }
  }, [timeline])

  const submitPrompt = useCallback(
    async (sourcePrompt, scenarioId = null, { announce } = { announce: true }) => {
      const trimmedPrompt = (sourcePrompt || '').trim()
      if (!trimmedPrompt) {
        setStatus({ type: 'error', message: 'Describe the timeline you want before calling /obj.' })
        return
      }

      setLoading(true)
      setStatus({ type: 'info', message: 'Composing timeline via /obj…' })
      setActiveScenarioId(scenarioId)

      try {
        const { payload } = await createRemoteObject({
          baseUrl: normalizedBaseUrl || undefined,
          structure: TIMELINE_RESPONSE_STRUCTURE,
          objectType: TIMELINE_OBJECT_TYPE,
          prompt: buildTimelinePrompt(trimmedPrompt),
          system: TIMELINE_SYSTEM_PROMPT,
          strict: true,
          model: model || undefined,
        })

        setTimeline(payload)
        if (announce) {
          setStatus({
            type: 'success',
            message: 'Timeline drafted! Scroll to explore each moment or try another prompt.',
          })
        } else {
          setStatus(null)
        }
      } catch (error) {
        console.error('Failed to create timeline via /obj', error)
        setStatus({
          type: 'error',
          message:
            error?.message || 'Timeline generation failed. Confirm the /obj endpoint is reachable and try again.',
        })
      } finally {
        setLoading(false)
      }
    },
    [model, normalizedBaseUrl]
  )

  useEffect(() => {
    if (!autoInitialized && FALLBACK_PROMPT) {
      submitPrompt(FALLBACK_PROMPT, TIMELINE_PRESET_SCENARIOS[0]?.id || null, { announce: false })
      setAutoInitialized(true)
    }
  }, [autoInitialized, submitPrompt])

  const handleScenarioSelect = useCallback(
    (scenario) => {
      setPrompt(scenario.prompt)
      submitPrompt(scenario.prompt, scenario.id)
    },
    [submitPrompt]
  )

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()
      submitPrompt(prompt, null)
    },
    [prompt, submitPrompt]
  )

  const { events, headline, summary, cta } = timelineMetadata

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-brand-300/50 bg-gradient-to-br from-brand-600/90 via-indigo-600/80 to-slate-900/90 px-8 py-12 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_65%)]" aria-hidden />
        <div className="relative z-10 space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
            📜 Timeline Studio
          </p>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold sm:text-4xl">Scroll through living narratives.</h1>
            <p className="max-w-3xl text-sm text-white/90 sm:text-base">
              Select a scenario or craft your own brief and we will call the <code className="rounded bg-white/20 px-1 py-0.5 text-xs font-semibold">/obj</code> route to stage a chronological story. Each event is returned with dates, titles, and descriptions ready for this interactive timeline.
            </p>
          </div>
          <ScenarioButtons activeScenarioId={activeScenarioId} loading={loading} onSelect={handleScenarioSelect} />
        </div>
        <div className="absolute -right-32 top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </section>

      <section className="grid gap-8 rounded-[2.5rem] border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Stage your own sequence</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Describe the journey you want to visualize. Chronicle will build an ordered list of events that feels cinematic and keeps readers scrolling.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="timeline-prompt">
              Timeline prompt
            </label>
            <textarea
              id="timeline-prompt"
              name="timeline-prompt"
              rows={5}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the timeline you want Chronicle to narrate…"
              className="w-full rounded-2xl border border-slate-300 bg-white/90 p-4 text-sm leading-relaxed text-slate-700 shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed dark:focus-visible:ring-offset-slate-900"
              >
                {loading ? 'Drafting timeline…' : 'Generate timeline'}
              </button>
              <Link
                to="/objectmaker"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300"
              >
                Visit Object Maker ↗
              </Link>
            </div>
          </form>
          <StatusBanner status={status} />
          {cta && cta.label && cta.url ? (
            <a
              href={cta.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-dashed border-brand-400/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-brand-600 transition hover:border-brand-500 hover:text-brand-700 dark:border-brand-500/60 dark:text-brand-300"
            >
              {cta.label}
              <span aria-hidden>↗</span>
            </a>
          ) : null}
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            {headline ? (
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{headline}</h3>
            ) : (
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Timeline preview</h3>
            )}
            {summary ? (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{summary}</p>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Events appear in a vertical rail. Scroll to follow the momentum.
              </p>
            )}
          </div>
          <div className="max-h-[32rem] overflow-y-auto pr-2">
            <TimelineRail events={events} />
          </div>
        </div>
      </section>
    </div>
  )
}
