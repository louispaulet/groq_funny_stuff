import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getExperienceById } from '../config/experiences'
import { createRemoteObject } from '../lib/objectApi'
import { normalizeBaseUrl } from '../lib/objectMakerUtils'
import { BANK_HOLIDAY_COUNTRY_OPTIONS, BANK_HOLIDAYS_BY_COUNTRY } from '../lib/bankHolidayData'

const TOTAL_PAID_LEAVE_DAYS = 25
const OBJECT_TYPE = 'bank_holiday_plan'

const RESPONSE_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    requestSummary: {
      type: 'object',
      additionalProperties: false,
      properties: {
        country: { type: 'string' },
        daysReservedForOtherPlans: { type: 'number' },
        daysAvailableForOptimization: { type: 'number' },
        totalBankHolidaysConsidered: { type: 'number' },
      },
      required: [
        'country',
        'daysReservedForOtherPlans',
        'daysAvailableForOptimization',
        'totalBankHolidaysConsidered',
      ],
    },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          label: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          leaveDates: {
            type: 'array',
            items: { type: 'string' },
          },
          leaveDaysUsed: { type: 'number' },
          totalContinuousDaysOff: { type: 'number' },
          bankHolidaysLeveraged: {
            type: 'array',
            items: { type: 'string' },
          },
          rationale: { type: 'string' },
        },
        required: [
          'label',
          'startDate',
          'endDate',
          'leaveDates',
          'leaveDaysUsed',
          'totalContinuousDaysOff',
          'bankHolidaysLeveraged',
          'rationale',
        ],
      },
    },
    comparison: {
      type: 'object',
      additionalProperties: false,
      properties: {
        optimizedLeaveDaysUsed: { type: 'number' },
        optimizedTotalDaysOff: { type: 'number' },
        randomAverageDaysOff: { type: 'number' },
        efficiencyGainPercentage: { type: 'number' },
        commentary: { type: 'string' },
      },
      required: [
        'optimizedLeaveDaysUsed',
        'optimizedTotalDaysOff',
        'randomAverageDaysOff',
        'efficiencyGainPercentage',
        'commentary',
      ],
    },
  },
  required: ['requestSummary', 'recommendations', 'comparison'],
}

const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'UTC' })
const readableFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' })
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })

function describeWeekendExtension(date) {
  const day = date.getUTCDay()
  switch (day) {
    case 0:
      return 'Falls on a Sunday — consider taking the preceding Friday or following Monday to benefit.'
    case 1:
      return 'Monday holiday — a single Friday off yields a four-day weekend.'
    case 2:
      return 'Tuesday holiday — taking Monday connects the prior weekend; consider extending into the week.'
    case 3:
      return 'Wednesday holiday — stacking Monday/Tuesday or Thursday/Friday can unlock a full week off.'
    case 4:
      return 'Thursday holiday — one Friday off secures a four-day getaway; add earlier days for more time.'
    case 5:
      return 'Friday holiday — combine with Thursday (and perhaps Monday) for a long stretch.'
    case 6:
      return 'Falls on a Saturday — request adjacent Friday or following Monday for impact.'
    default:
      return ''
  }
}

function buildPrompt({ countryLabel, daysToOptimize, holidays, locale }) {
  const reservedDays = Math.max(TOTAL_PAID_LEAVE_DAYS - daysToOptimize, 0)
  const holidayLines = holidays.map((holiday) => {
    const date = new Date(`${holiday.date}T00:00:00Z`)
    const weekday = weekdayFormatter.format(date)
    const readableDate = new Intl.DateTimeFormat(locale || 'en-US', {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(date)
    const extensionTip = describeWeekendExtension(date)
    return `- ${holiday.name}: ${holiday.date} (${weekday}) — ${readableDate}. ${extensionTip}`
  })

  const promptSections = [
    'You are BHP (Bank Holiday Planner), an assistant that designs optimal vacation plans using paid leave days and national bank holidays.',
    `Country: ${countryLabel}.`,
    `Total paid leave days available this year: ${TOTAL_PAID_LEAVE_DAYS}.`,
    `Days already committed to other plans: ${reservedDays}.`,
    `Days available for optimization: ${daysToOptimize}.`,
    'Use the following list of bank holidays (ISO date order preserved):',
    holidayLines.join('\n'),
    '',
    'Goals:',
    '- Maximize total uninterrupted days off while spending no more than the available optimization days.',
    '- Suggest specific paid leave dates to bridge weekends and holidays.',
    '- Provide a clear rationale for each proposed vacation block.',
    '- Include a comparison that estimates the average days off someone would gain by randomly placing the same number of leave days.',
    '- Respect the response JSON schema exactly.',
    '',
    'Ensure recommendations are in chronological order and avoid overlapping leave suggestions.',
  ]

  return promptSections.join('\n')
}

function HolidayList({ holidays, locale }) {
  if (!holidays.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No bank holidays configured for this country.</p>
    )
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {holidays.map((holiday) => {
        const date = new Date(`${holiday.date}T00:00:00Z`)
        const weekday = weekdayFormatter.format(date)
        const formattedDate = new Intl.DateTimeFormat(locale || 'en-US', {
          dateStyle: 'long',
          timeZone: 'UTC',
        }).format(date)
        return (
          <li
            key={holiday.date}
            className="rounded-3xl border border-emerald-200/70 bg-white/80 px-4 py-3 text-sm shadow-sm backdrop-blur dark:border-emerald-500/40 dark:bg-slate-900/60"
          >
            <div className="font-medium text-slate-900 dark:text-slate-100">{holiday.name}</div>
            <div className="text-slate-600 dark:text-slate-400">{formattedDate}</div>
            <div className="text-xs text-slate-500 dark:text-slate-500">{weekday}</div>
            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">{describeWeekendExtension(date)}</div>
          </li>
        )
      })}
    </ol>
  )
}

function expandDateRange(startISO, endISO) {
  if (!startISO || !endISO) return []
  const start = new Date(`${startISO}T00:00:00Z`)
  const end = new Date(`${endISO}T00:00:00Z`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return []
  const days = []
  const cursor = new Date(start)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

function CalendarHeatmap({ year, holidays, recommendations }) {
  const holidaySet = useMemo(() => new Set(holidays.map((holiday) => holiday.date)), [holidays])
  const leaveDaySet = useMemo(() => {
    const set = new Set()
    recommendations
      ?.flatMap((rec) => Array.isArray(rec.leaveDates) ? rec.leaveDates : [])
      .forEach((date) => {
        if (typeof date === 'string') set.add(date)
      })
    return set
  }, [recommendations])
  const getawaySet = useMemo(() => {
    const set = new Set()
    recommendations?.forEach((rec) => {
      expandDateRange(rec.startDate, rec.endDate).forEach((date) => set.add(date))
    })
    return set
  }, [recommendations])

  const start = new Date(Date.UTC(year, 0, 1))
  const end = new Date(Date.UTC(year + 1, 0, 1))

  const weeks = []
  let currentWeek = new Array(start.getUTCDay()).fill(null)
  for (let cursor = new Date(start); cursor < end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    currentWeek.push(new Date(cursor))
  }
  if (currentWeek.length) {
    while (currentWeek.length < 7) currentWeek.push(null)
    weeks.push(currentWeek)
  }

  const monthLabels = []
  weeks.forEach((week, index) => {
    const firstValid = week.find(Boolean)
    if (!firstValid) return
    const month = firstValid.getUTCMonth()
    if (!monthLabels.some((entry) => entry.month === month)) {
      monthLabels.push({ month, weekIndex: index, label: monthFormatter.format(firstValid) })
    }
  })

  return (
    <div className="space-y-2">
      <div className="flex gap-4 text-xs text-emerald-50/90">
        {monthLabels.map((entry) => (
          <span key={entry.month} style={{ marginLeft: `${entry.weekIndex * 16}px` }}>{entry.label}</span>
        ))}
      </div>
      <div className="flex gap-[3px] rounded-3xl bg-emerald-900/40 p-3 ring-1 ring-emerald-500/40">
        <div className="grid grid-rows-7 gap-[3px] pr-2 text-[10px] uppercase tracking-wide text-emerald-100/70">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
            <span key={label} className="flex h-3 items-center">{label}</span>
          ))}
        </div>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-[3px]">
              {week.map((date, dayIndex) => {
                if (!date) {
                  return <span key={`empty-${weekIndex}-${dayIndex}`} className="h-3 w-3 rounded-sm bg-transparent" />
                }
                const iso = date.toISOString().slice(0, 10)
                const isHoliday = holidaySet.has(iso)
                const isLeave = leaveDaySet.has(iso)
                const isVacation = getawaySet.has(iso)
                const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6

                let cellClass = 'bg-emerald-950/30'
                if (isVacation) cellClass = 'bg-teal-300'
                if (isHoliday) cellClass = 'bg-emerald-400'
                if (isLeave) cellClass = 'bg-amber-300'
                if (!isHoliday && !isLeave && !isVacation && isWeekend) cellClass = 'bg-emerald-950/50'

                const titleParts = [readableFormatter.format(date)]
                if (isHoliday) titleParts.push('Bank holiday')
                if (isLeave) titleParts.push('Recommended leave day')
                else if (isVacation) titleParts.push('Included in suggested getaway')
                else if (isWeekend) titleParts.push('Weekend')

                return (
                  <span
                    key={iso}
                    className={`h-3 w-3 rounded-sm transition ${cellClass}`}
                    title={titleParts.join(' • ')}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-100/80">
        <LegendSwatch className="bg-amber-300" label="Recommended leave" />
        <LegendSwatch className="bg-emerald-400" label="Bank holiday" />
        <LegendSwatch className="bg-teal-300" label="Vacation span" />
        <LegendSwatch className="bg-emerald-950/50" label="Weekends" />
      </div>
    </div>
  )
}

function LegendSwatch({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm ${className}`} />
      <span>{label}</span>
    </span>
  )
}

function Recommendations({ recommendations }) {
  if (!recommendations?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No optimization suggestions were returned. Try adjusting the inputs and running the planner again.
      </p>
    )
  }

  return (
    <ol className="space-y-4">
      {recommendations.map((item, index) => {
        const leaveDates = Array.isArray(item.leaveDates) ? item.leaveDates : []
        const holidaysUsed = Array.isArray(item.bankHolidaysLeveraged) ? item.bankHolidaysLeveraged : []
        return (
          <li
            key={`${item.startDate}-${item.endDate}-${index}`}
            className="rounded-3xl border border-emerald-400/30 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-500/40 dark:bg-slate-900/70"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                {item.label || 'Vacation block'}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {item.startDate} → {item.endDate}
              </span>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
              <SummaryPill title="Leave days used" value={item.leaveDaysUsed} />
              <SummaryPill title="Total days off" value={item.totalContinuousDaysOff} />
              <div className="rounded-2xl bg-emerald-500/5 px-3 py-2">
                <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Holidays leveraged</div>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  {holidaysUsed.length ? holidaysUsed.join(', ') : '—'}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <span className="font-medium text-slate-700 dark:text-slate-200">Paid leave dates:</span>{' '}
                {leaveDates.length ? leaveDates.join(', ') : 'None suggested'}
              </div>
              <p className="leading-relaxed">{item.rationale}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function SummaryPill({ title, value }) {
  return (
    <div className="rounded-2xl bg-emerald-500/5 px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">{title}</div>
      <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  )
}

function Comparison({ comparison }) {
  if (!comparison) return null
  return (
    <div className="grid gap-4 rounded-3xl border border-emerald-500/30 bg-white/80 p-5 shadow-sm dark:border-emerald-500/40 dark:bg-slate-900/70 sm:grid-cols-2">
      <div>
        <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Optimized outcome</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {comparison.optimizedTotalDaysOff}
          <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">days off</span>
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Using {comparison.optimizedLeaveDaysUsed} paid leave days
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Random placement baseline</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {comparison.randomAverageDaysOff}
          <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">days off</span>
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Efficiency gain: {comparison.efficiencyGainPercentage}%
        </div>
      </div>
      <div className="sm:col-span-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {comparison.commentary}
      </div>
    </div>
  )
}

export default function BankHolidayPlannerPage() {
  const objectMaker = getExperienceById('objectmaker')
  const [countryId, setCountryId] = useState(BANK_HOLIDAY_COUNTRY_OPTIONS[0]?.id || 'usa')
  const [daysToOptimizeInput, setDaysToOptimizeInput] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const country = BANK_HOLIDAY_COUNTRY_OPTIONS.find((option) => option.id === countryId) ||
    BANK_HOLIDAY_COUNTRY_OPTIONS[0]
  const holidays = useMemo(() => BANK_HOLIDAYS_BY_COUNTRY[country.id] || [], [country.id])
  const normalizedBaseUrl = normalizeBaseUrl(objectMaker?.defaultBaseUrl)
  const model = objectMaker?.defaultModel || objectMaker?.modelOptions?.[0]
  const daysToOptimize = Number.parseInt(daysToOptimizeInput, 10)

  const plannerYear = useMemo(() => {
    const fromHolidays = holidays.length
      ? new Date(`${holidays[0].date}T00:00:00Z`).getUTCFullYear()
      : null
    if (Number.isInteger(fromHolidays)) return fromHolidays
    if (result?.recommendations?.length) {
      const first = result.recommendations.find((rec) => rec?.startDate)
      if (first) {
        const year = new Date(`${first.startDate}T00:00:00Z`).getUTCFullYear()
        if (Number.isInteger(year)) return year
      }
    }
    return new Date().getUTCFullYear()
  }, [holidays, result?.recommendations])

  const reservedDays = Math.max(TOTAL_PAID_LEAVE_DAYS - (Number.isFinite(daysToOptimize) ? daysToOptimize : 0), 0)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const sanitizedDays = Number.isFinite(daysToOptimize) && daysToOptimize > 0 ? daysToOptimize : 0
    if (!sanitizedDays) {
      setError('Enter how many paid leave days you can dedicate to optimization.')
      return
    }
    if (!holidays.length) {
      setError('No bank holidays configured for this country yet.')
      return
    }

    if (!normalizedBaseUrl) {
      setError('Missing Object Maker base URL for /obj requests.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const prompt = buildPrompt({
        countryLabel: country.label,
        daysToOptimize: sanitizedDays,
        holidays,
        locale: country.locale,
      })
      const { payload } = await createRemoteObject({
        baseUrl: normalizedBaseUrl,
        structure: RESPONSE_STRUCTURE,
        objectType: OBJECT_TYPE,
        prompt,
        strict: true,
        model,
      })
      setResult(payload)
    } catch (err) {
      setError(err?.message || 'BHP request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-emerald-600 via-cyan-600 to-teal-600 px-8 py-10 text-emerald-50 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" aria-hidden />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-100/80">BHP · Bank Holiday Planner</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Turn bank holidays into maxed-out vacations.</h1>
            <p className="text-base leading-relaxed text-emerald-50/90">
              Choose a supported country, enter the paid leave you can flex, and BHP calls the
              <code className="mx-1 rounded bg-emerald-950/60 px-1 py-0.5 text-[0.7rem] font-semibold text-emerald-100">/obj</code>
              route with a strict schema. The response maps out PTO requests that weave weekends and bank holidays into long,
              continuous breaks—and shows how that beats random scheduling.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-emerald-100/90">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                USA · UK · FR · ES · IT
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-50/20"
              >
                ← Back to overview
              </Link>
            </div>
          </div>
          <div className="hidden relative min-h-[160px] overflow-hidden rounded-3xl border border-emerald-200/40 bg-white/10 p-4 shadow-lg backdrop-blur-sm lg:flex lg:items-center lg:justify-center">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_65%)]"
              aria-hidden
            />
            <div className="relative z-10 w-full">
              <CalendarHeatmap year={plannerYear} holidays={holidays} recommendations={result?.recommendations} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 rounded-3xl border border-emerald-500/30 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-emerald-500/40 dark:bg-slate-900/70 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Country</span>
            <select
              value={countryId}
              onChange={(event) => setCountryId(event.target.value)}
              className="rounded-2xl border border-emerald-400/60 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-emerald-500/40 dark:bg-slate-950 dark:text-slate-100"
            >
              {BANK_HOLIDAY_COUNTRY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
              Days to optimize
            </span>
            <input
              type="number"
              min="1"
              max={TOTAL_PAID_LEAVE_DAYS}
              value={daysToOptimizeInput}
              onChange={(event) => setDaysToOptimizeInput(event.target.value)}
              className="rounded-2xl border border-emerald-400/60 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-emerald-500/40 dark:bg-slate-950 dark:text-slate-100"
            />
            <span className="text-xs text-emerald-700/80 dark:text-emerald-200/80">
              {reservedDays > 0
                ? `${reservedDays} of your ${TOTAL_PAID_LEAVE_DAYS} paid leave days are already reserved for other plans.`
                : 'All paid leave days are available for optimization.'}
            </span>
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-200">
            <span>
              BHP will request <strong>{daysToOptimize || 0}</strong> paid leave days via the
              <code className="mx-1 rounded bg-emerald-500/10 px-1 py-0.5 text-[0.65rem] font-semibold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-100">/obj</code>
              endpoint using {model ? <span className="font-medium">{model}</span> : 'the configured model'}.
            </span>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Planning…' : 'Run planner'}
            </button>
          </div>
        </form>
        {error && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bank holidays considered</h2>
        <HolidayList holidays={holidays} locale={country.locale} />
      </section>

      <section className="space-y-4">
        <header className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Optimization output</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Once the {OBJECT_TYPE} response lands, you will see suggested PTO placements, the total days unlocked, and how that compares to random scheduling.
          </p>
        </header>
        {loading && (
          <div className="rounded-3xl border border-emerald-500/30 bg-white/80 px-4 py-6 text-center text-sm text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-slate-900/70 dark:text-emerald-200">
            Crunching possibilities with BHP…
          </div>
        )}
        {!loading && result && (
          <div className="space-y-6">
            {result.requestSummary && (
              <div className="rounded-3xl border border-emerald-500/30 bg-white/80 p-5 shadow-sm dark:border-emerald-500/40 dark:bg-slate-900/70">
                <div className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-200">Request summary</div>
                <dl className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-200">Country</dt>
                    <dd>{result.requestSummary.country}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-200">Days reserved elsewhere</dt>
                    <dd>{result.requestSummary.daysReservedForOtherPlans}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-200">Days to optimize</dt>
                    <dd>{result.requestSummary.daysAvailableForOptimization}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-200">Bank holidays considered</dt>
                    <dd>{result.requestSummary.totalBankHolidaysConsidered}</dd>
                  </div>
                </dl>
              </div>
            )}
            <div className="lg:hidden">
              <CalendarHeatmap year={plannerYear} holidays={holidays} recommendations={result.recommendations} />
            </div>
            <Recommendations recommendations={result.recommendations} />
            <Comparison comparison={result.comparison} />
          </div>
        )}
        {!loading && !result && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Provide your constraints above and run the planner to surface optimized vacation blocks.
          </p>
        )}
      </section>
    </div>
  )
}
