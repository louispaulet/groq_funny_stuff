import { useMemo, useState } from 'react'
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
    <ol className="space-y-2">
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
            className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div className="font-medium text-slate-900 dark:text-slate-100">{holiday.name}</div>
            <div className="text-slate-600 dark:text-slate-400">
              {formattedDate} · {weekday}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              {describeWeekendExtension(date)}
            </div>
          </li>
        )
      })}
    </ol>
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
            className="rounded-3xl border border-brand-500/20 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-brand-400/30 dark:bg-slate-900/60"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:bg-brand-500/20 dark:text-brand-200">
                {item.label || 'Vacation block'}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.startDate} → {item.endDate}
              </span>
            </div>
            <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/80">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Leave days used</div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.leaveDaysUsed}</div>
              </div>
              <div className="rounded-2xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/80">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total days off</div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">{item.totalContinuousDaysOff}</div>
              </div>
              <div className="rounded-2xl bg-slate-100/70 px-3 py-2 dark:bg-slate-800/80">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Holidays leveraged</div>
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

function Comparison({ comparison }) {
  if (!comparison) return null
  return (
    <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:grid-cols-2">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Optimized outcome</div>
        <div className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
          {comparison.optimizedTotalDaysOff}
          <span className="ml-1 text-base font-medium text-slate-500 dark:text-slate-400">days off</span>
        </div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Using {comparison.optimizedLeaveDaysUsed} paid leave days
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Random placement baseline</div>
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

export default function ObjectMakerBhp() {
  const experience = getExperienceById('objectmaker')
  const [countryId, setCountryId] = useState(BANK_HOLIDAY_COUNTRY_OPTIONS[0]?.id || 'usa')
  const [daysToOptimizeInput, setDaysToOptimizeInput] = useState('10')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const country = BANK_HOLIDAY_COUNTRY_OPTIONS.find((option) => option.id === countryId) ||
    BANK_HOLIDAY_COUNTRY_OPTIONS[0]
  const holidays = useMemo(() => BANK_HOLIDAYS_BY_COUNTRY[country.id] || [], [country.id])
  const normalizedBaseUrl = normalizeBaseUrl(experience?.defaultBaseUrl)
  const model = experience?.defaultModel || experience?.modelOptions?.[0]

  const daysToOptimize = Number.parseInt(daysToOptimizeInput, 10)

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

  const reservedDays = Math.max(TOTAL_PAID_LEAVE_DAYS - (Number.isFinite(daysToOptimize) ? daysToOptimize : 0), 0)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">BHP — Bank Holiday Planner</h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Feed your available paid leave days and country-specific bank holidays into the Object Maker engine. BHP calls the{' '}
            <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> route with a structured schema so the model can stitch together long stretches of time off while respecting your constraints.
          </p>
        </header>
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 md:grid-cols-2"
        >
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Country
            </span>
            <select
              value={countryId}
              onChange={(event) => setCountryId(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {BANK_HOLIDAY_COUNTRY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Days to optimize
            </span>
            <input
              type="number"
              min="1"
              max={TOTAL_PAID_LEAVE_DAYS}
              value={daysToOptimizeInput}
              onChange={(event) => setDaysToOptimizeInput(event.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {reservedDays > 0
                ? `${reservedDays} of your ${TOTAL_PAID_LEAVE_DAYS} paid leave days are already reserved for other plans.`
                : 'All paid leave days are available for optimization.'}
            </span>
          </label>
          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              BHP will request <strong>{daysToOptimize || 0}</strong> dedicated leave days from the{' '}
              <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> endpoint using the{' '}
              {model ? <span className="font-medium text-slate-700 dark:text-slate-200">{model}</span> : 'configured model'}.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 px-5 py-2 text-sm font-semibold text-slate-900 shadow transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Bank holidays considered</h2>
        <HolidayList holidays={holidays} locale={country.locale} />
      </section>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Optimization output</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Once the {OBJECT_TYPE} response lands, you will see suggested PTO placements, the total days unlocked, and how that compares to random scheduling.
          </p>
        </header>
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white/70 px-4 py-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            Crunching possibilities with BHP…
          </div>
        )}
        {!loading && result && (
          <div className="space-y-6">
            {result.requestSummary && (
              <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
                <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Request summary</div>
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
