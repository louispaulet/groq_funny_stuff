import { useCallback, useEffect, useMemo, useState } from 'react'
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

const MONTH_NAME_TO_INDEX = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
}

const SEASON_TO_MONTH = {
  spring: 3,
  summer: 6,
  autumn: 9,
  fall: 9,
  winter: 12,
}

function parseTimelineDate(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const isoMatch = trimmed.match(/^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/)
  if (isoMatch) {
    const year = Number(isoMatch[1])
    const month = isoMatch[2] ? Number(isoMatch[2]) : 1
    const day = isoMatch[3] ? Number(isoMatch[3]) : 1
    const date = new Date(Date.UTC(year, month - 1, day))
    if (!Number.isNaN(date.getTime())) {
      const precision = isoMatch[3] ? 'day' : isoMatch[2] ? 'month' : 'year'
      return { date, precision }
    }
  }

  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/)
  if (monthYearMatch) {
    const monthIndex = MONTH_NAME_TO_INDEX[monthYearMatch[1].toLowerCase()]
    const year = Number(monthYearMatch[2])
    if (monthIndex) {
      const date = new Date(Date.UTC(year, monthIndex - 1, 1))
      if (!Number.isNaN(date.getTime())) {
        return { date, precision: 'month' }
      }
    }
  }

  const seasonMatch = trimmed.match(/^(Spring|Summer|Autumn|Fall|Winter)\s+(\d{4})$/i)
  if (seasonMatch) {
    const monthIndex = SEASON_TO_MONTH[seasonMatch[1].toLowerCase()]
    const year = Number(seasonMatch[2])
    if (monthIndex) {
      const date = new Date(Date.UTC(year, monthIndex - 1, 1))
      if (!Number.isNaN(date.getTime())) {
        return { date, precision: 'season' }
      }
    }
  }

  const quarterMatch = trimmed.match(/^Q([1-4])\s+(\d{4})$/i)
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1])
    const year = Number(quarterMatch[2])
    const monthIndex = (quarter - 1) * 3 + 1
    const date = new Date(Date.UTC(year, monthIndex - 1, 1))
    if (!Number.isNaN(date.getTime())) {
      return { date, precision: 'quarter' }
    }
  }

  const parsed = Date.parse(trimmed)
  if (!Number.isNaN(parsed)) {
    return { date: new Date(parsed), precision: 'day' }
  }

  return null
}

function formatTimelineDate(value) {
  if (!value) return ''
  const trimmed = value.trim()
  const parsed = parseTimelineDate(trimmed)
  if (parsed) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: parsed.precision === 'year' ? undefined : 'short',
      day: parsed.precision === 'day' ? 'numeric' : undefined,
      timeZone: 'UTC',
    })
    return formatter.format(parsed.date)
  }
  return trimmed
}

function TimelineEventCard({ event, isLast, spacingAbove }) {
  const dateLabel = formatTimelineDate(event.date || '')
  return (
    <li className="relative pl-16" style={spacingAbove ? { marginTop: spacingAbove } : undefined}>
      <span
        className={`absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg shadow-sm ${
          isLast
            ? 'border-brand-500 bg-gradient-to-br from-brand-500 via-purple-500 to-sky-500 text-white'
            : 'border-white/60 bg-white text-brand-500 shadow-md dark:border-slate-700 dark:bg-slate-800/80'
        }`}
        aria-hidden
      >
        {event.icon ? event.icon : '✦'}
      </span>
      {!isLast ? (
        <span className="pointer-events-none absolute left-[18px] top-10 h-full w-[3px] bg-gradient-to-b from-brand-400 via-brand-500/40 to-transparent" aria-hidden />
      ) : null}
      <div className="relative rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-lg backdrop-blur-lg transition hover:-translate-y-1 hover:border-brand-300/80 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">{dateLabel}</p>
          {event.location ? (
            <p className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
              {event.location}
            </p>
          ) : null}
        </div>
        <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{event.title}</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">{event.description}</p>
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

  const enrichedEvents = events.map((event) => {
    const parsed = parseTimelineDate(event.date || '')
    return {
      ...event,
      parsedTimestamp: parsed ? parsed.date.getTime() : null,
    }
  })

  const validTimestamps = enrichedEvents
    .map((event) => event.parsedTimestamp)
    .filter((timestamp) => typeof timestamp === 'number')

  const minTimestamp = validTimestamps.length ? Math.min(...validTimestamps) : null
  const maxTimestamp = validTimestamps.length ? Math.max(...validTimestamps) : null
  const range = minTimestamp !== null && maxTimestamp !== null ? maxTimestamp - minTimestamp : null
  const baseGap = 120
  const minGap = 96
  const maxGap = 260

  const eventsWithSpacing = enrichedEvents.map((event, index) => {
    if (index === 0) {
      return { event, spacingAbove: 0, isLast: enrichedEvents.length === 1 }
    }

    const previous = enrichedEvents[index - 1]

    let spacing = baseGap
    if (
      range &&
      range > 0 &&
      typeof event.parsedTimestamp === 'number' &&
      typeof previous.parsedTimestamp === 'number'
    ) {
      const delta = Math.abs(event.parsedTimestamp - previous.parsedTimestamp)
      const ratio = Math.min(1, Math.max(0, delta / range))
      spacing = Math.round(minGap + ratio * (maxGap - minGap))
    }

    return { event, spacingAbove: spacing, isLast: index === enrichedEvents.length - 1 }
  })

  return (
    <ol className="relative mt-12 space-y-0 pb-16">
      <span className="pointer-events-none absolute left-[22px] top-0 h-full w-[2px] bg-gradient-to-b from-brand-300 via-brand-500/40 to-transparent" aria-hidden />
      {eventsWithSpacing.map(({ event, spacingAbove, isLast }, index) => (
        <TimelineEventCard
          key={`${event.date}-${event.title}-${index}`}
          event={event}
          isLast={isLast}
          spacingAbove={spacingAbove}
        />
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

  const handleClear = useCallback(() => {
    setPrompt('')
    setTimeline(null)
    setStatus(null)
    setActiveScenarioId(null)
  }, [])

  const { events, headline, summary, cta } = timelineMetadata

  return (
    <div className="space-y-16 pb-24">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-10">
        <div className="absolute -right-24 top-8 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" aria-hidden />
        <div className="absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-purple-500/10 blur-3xl" aria-hidden />
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">
              📜 Timeline Studio
            </p>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">Compose a living chronology.</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Choose a preset or write your own brief, then let Chronicle orchestrate a storyline of pivotal moments. Generate when ready, or clear everything to start fresh.
              </p>
            </div>
          </div>

          <ScenarioButtons activeScenarioId={activeScenarioId} loading={loading} onSelect={handleScenarioSelect} />

          <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-sm transition focus-within:border-brand-300/80 dark:border-slate-700 dark:bg-slate-900/60">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" htmlFor="timeline-prompt">
              Timeline prompt
            </label>
            <textarea
              id="timeline-prompt"
              name="timeline-prompt"
              rows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe the timeline you want Chronicle to narrate…"
              className="w-full rounded-2xl border border-transparent bg-white/90 p-4 text-sm leading-relaxed text-slate-700 shadow-sm transition focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:bg-slate-900/70 dark:text-slate-100"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed dark:focus-visible:ring-offset-slate-900"
              >
                {loading ? 'Drafting timeline…' : 'Generate timeline'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-rose-400 dark:hover:text-rose-300"
              >
                Clear timeline
              </button>
            </div>
            <StatusBanner status={status} />
          </form>
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[3rem] border border-slate-200/70 bg-gradient-to-b from-slate-50 via-white to-slate-100 p-6 shadow-xl dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 sm:p-12">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent" aria-hidden />
        <div className="relative z-10 mx-auto max-w-4xl space-y-10">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              {headline || 'Scroll to follow each turning point'}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {summary ||
                'Each milestone fans out along the page. Keep scrolling to watch the timeline advance and feel how the cadence shifts between quiet setups and decisive reveals.'}
            </p>
          </div>

          <TimelineRail events={events} />

          {cta && cta.label && cta.url ? (
            <div className="flex justify-center">
              <a
                href={cta.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-400/70 bg-white px-5 py-2 text-sm font-semibold text-brand-600 shadow transition hover:border-brand-500 hover:text-brand-700 dark:border-brand-500/60 dark:bg-slate-900/70 dark:text-brand-300"
              >
                {cta.label}
                <span aria-hidden>↗</span>
              </a>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
