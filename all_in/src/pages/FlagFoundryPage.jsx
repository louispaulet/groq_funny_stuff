import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

const LOAD_INTERVAL_MS = 1000
const createEntry = (country) => ({ country, status: 'idle', prompt: '', dataUrl: '', error: '' })
const buildDataUrl = (payload) => {
  const inline = typeof payload?.dataUrl === 'string' ? payload.dataUrl.trim() : ''
  if (inline.startsWith('data:image/svg+xml')) return inline
  const svgMarkup = typeof payload?.svg === 'string' ? payload.svg.trim() : ''
  return svgMarkup ? `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}` : ''
}

const CONTINENTS = [
  {
    id: 'europe',
    name: 'Europe',
    description:
      'Auto-queues every European flag so you can watch the continent populate without lifting a finger.',
    countries: [
      { name: 'Albania', code: 'AL' },
      { name: 'Andorra', code: 'AD' },
      { name: 'Austria', code: 'AT' },
      { name: 'Belarus', code: 'BY' },
      { name: 'Belgium', code: 'BE' },
      { name: 'Bosnia and Herzegovina', code: 'BA' },
      { name: 'Bulgaria', code: 'BG' },
      { name: 'Croatia', code: 'HR' },
      { name: 'Cyprus', code: 'CY' },
      { name: 'Czechia', code: 'CZ' },
      { name: 'Denmark', code: 'DK' },
      { name: 'Estonia', code: 'EE' },
      { name: 'Finland', code: 'FI' },
      { name: 'France', code: 'FR' },
      { name: 'Germany', code: 'DE' },
      { name: 'Greece', code: 'GR' },
      { name: 'Hungary', code: 'HU' },
      { name: 'Iceland', code: 'IS' },
      { name: 'Ireland', code: 'IE' },
      { name: 'Italy', code: 'IT' },
      { name: 'Latvia', code: 'LV' },
      { name: 'Liechtenstein', code: 'LI' },
      { name: 'Lithuania', code: 'LT' },
      { name: 'Luxembourg', code: 'LU' },
      { name: 'Malta', code: 'MT' },
      { name: 'Moldova', code: 'MD' },
      { name: 'Monaco', code: 'MC' },
      { name: 'Montenegro', code: 'ME' },
      { name: 'Netherlands', code: 'NL' },
      { name: 'North Macedonia', code: 'MK' },
      { name: 'Norway', code: 'NO' },
      { name: 'Poland', code: 'PL' },
      { name: 'Portugal', code: 'PT' },
      { name: 'Romania', code: 'RO' },
      { name: 'Russia', code: 'RU' },
      { name: 'San Marino', code: 'SM' },
      { name: 'Serbia', code: 'RS' },
      { name: 'Slovakia', code: 'SK' },
      { name: 'Slovenia', code: 'SI' },
      { name: 'Spain', code: 'ES' },
      { name: 'Sweden', code: 'SE' },
      { name: 'Switzerland', code: 'CH' },
      { name: 'Ukraine', code: 'UA' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Vatican City', code: 'VA' },
    ],
  },
  {
    id: 'africa',
    name: 'Africa',
    description:
      'Queue the full suite of African nations when you are ready to tour the continent.',
    countries: [
      { name: 'Algeria', code: 'DZ' },
      { name: 'Angola', code: 'AO' },
      { name: 'Benin', code: 'BJ' },
      { name: 'Botswana', code: 'BW' },
      { name: 'Burkina Faso', code: 'BF' },
      { name: 'Burundi', code: 'BI' },
      { name: 'Cabo Verde', code: 'CV' },
      { name: 'Cameroon', code: 'CM' },
      { name: 'Central African Republic', code: 'CF' },
      { name: 'Chad', code: 'TD' },
      { name: 'Comoros', code: 'KM' },
      { name: 'Democratic Republic of the Congo', code: 'CD' },
      { name: 'Republic of the Congo', code: 'CG' },
      { name: "Côte d'Ivoire", code: 'CI' },
      { name: 'Djibouti', code: 'DJ' },
      { name: 'Egypt', code: 'EG' },
      { name: 'Equatorial Guinea', code: 'GQ' },
      { name: 'Eritrea', code: 'ER' },
      { name: 'Eswatini', code: 'SZ' },
      { name: 'Ethiopia', code: 'ET' },
      { name: 'Gabon', code: 'GA' },
      { name: 'Gambia', code: 'GM' },
      { name: 'Ghana', code: 'GH' },
      { name: 'Guinea', code: 'GN' },
      { name: 'Guinea-Bissau', code: 'GW' },
      { name: 'Kenya', code: 'KE' },
      { name: 'Lesotho', code: 'LS' },
      { name: 'Liberia', code: 'LR' },
      { name: 'Libya', code: 'LY' },
      { name: 'Madagascar', code: 'MG' },
      { name: 'Malawi', code: 'MW' },
      { name: 'Mali', code: 'ML' },
      { name: 'Mauritania', code: 'MR' },
      { name: 'Mauritius', code: 'MU' },
      { name: 'Morocco', code: 'MA' },
      { name: 'Mozambique', code: 'MZ' },
      { name: 'Namibia', code: 'NA' },
      { name: 'Niger', code: 'NE' },
      { name: 'Nigeria', code: 'NG' },
      { name: 'Rwanda', code: 'RW' },
      { name: 'São Tomé and Príncipe', code: 'ST' },
      { name: 'Senegal', code: 'SN' },
      { name: 'Seychelles', code: 'SC' },
      { name: 'Sierra Leone', code: 'SL' },
      { name: 'Somalia', code: 'SO' },
      { name: 'South Africa', code: 'ZA' },
      { name: 'South Sudan', code: 'SS' },
      { name: 'Sudan', code: 'SD' },
      { name: 'Tanzania', code: 'TZ' },
      { name: 'Togo', code: 'TG' },
      { name: 'Tunisia', code: 'TN' },
      { name: 'Uganda', code: 'UG' },
      { name: 'Zambia', code: 'ZM' },
      { name: 'Zimbabwe', code: 'ZW' },
    ],
  },
  {
    id: 'asia',
    name: 'Asia',
    description: 'From the Middle East to the Pacific Rim, queue every Asian flag on demand.',
    countries: [
      { name: 'Afghanistan', code: 'AF' },
      { name: 'Armenia', code: 'AM' },
      { name: 'Azerbaijan', code: 'AZ' },
      { name: 'Bahrain', code: 'BH' },
      { name: 'Bangladesh', code: 'BD' },
      { name: 'Bhutan', code: 'BT' },
      { name: 'Brunei', code: 'BN' },
      { name: 'Cambodia', code: 'KH' },
      { name: 'China', code: 'CN' },
      { name: 'Georgia', code: 'GE' },
      { name: 'India', code: 'IN' },
      { name: 'Indonesia', code: 'ID' },
      { name: 'Iran', code: 'IR' },
      { name: 'Iraq', code: 'IQ' },
      { name: 'Israel', code: 'IL' },
      { name: 'Japan', code: 'JP' },
      { name: 'Jordan', code: 'JO' },
      { name: 'Kazakhstan', code: 'KZ' },
      { name: 'Kuwait', code: 'KW' },
      { name: 'Kyrgyzstan', code: 'KG' },
      { name: 'Laos', code: 'LA' },
      { name: 'Lebanon', code: 'LB' },
      { name: 'Malaysia', code: 'MY' },
      { name: 'Maldives', code: 'MV' },
      { name: 'Mongolia', code: 'MN' },
      { name: 'Myanmar', code: 'MM' },
      { name: 'Nepal', code: 'NP' },
      { name: 'North Korea', code: 'KP' },
      { name: 'Oman', code: 'OM' },
      { name: 'Pakistan', code: 'PK' },
      { name: 'Palestine', code: 'PS' },
      { name: 'Philippines', code: 'PH' },
      { name: 'Qatar', code: 'QA' },
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'Singapore', code: 'SG' },
      { name: 'South Korea', code: 'KR' },
      { name: 'Sri Lanka', code: 'LK' },
      { name: 'Syria', code: 'SY' },
      { name: 'Taiwan', code: 'TW' },
      { name: 'Tajikistan', code: 'TJ' },
      { name: 'Thailand', code: 'TH' },
      { name: 'Timor-Leste', code: 'TL' },
      { name: 'Turkey', code: 'TR' },
      { name: 'Turkmenistan', code: 'TM' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'Uzbekistan', code: 'UZ' },
      { name: 'Vietnam', code: 'VN' },
      { name: 'Yemen', code: 'YE' },
    ],
  },
  {
    id: 'north-america',
    name: 'North America',
    description: 'Includes Canada, the United States, Mexico, Central America, and the Caribbean.',
    countries: [
      { name: 'Antigua and Barbuda', code: 'AG' },
      { name: 'Bahamas', code: 'BS' },
      { name: 'Barbados', code: 'BB' },
      { name: 'Belize', code: 'BZ' },
      { name: 'Canada', code: 'CA' },
      { name: 'Costa Rica', code: 'CR' },
      { name: 'Cuba', code: 'CU' },
      { name: 'Dominica', code: 'DM' },
      { name: 'Dominican Republic', code: 'DO' },
      { name: 'El Salvador', code: 'SV' },
      { name: 'Grenada', code: 'GD' },
      { name: 'Guatemala', code: 'GT' },
      { name: 'Haiti', code: 'HT' },
      { name: 'Honduras', code: 'HN' },
      { name: 'Jamaica', code: 'JM' },
      { name: 'Mexico', code: 'MX' },
      { name: 'Nicaragua', code: 'NI' },
      { name: 'Panama', code: 'PA' },
      { name: 'Saint Kitts and Nevis', code: 'KN' },
      { name: 'Saint Lucia', code: 'LC' },
      { name: 'Saint Vincent and the Grenadines', code: 'VC' },
      { name: 'Trinidad and Tobago', code: 'TT' },
      { name: 'United States', code: 'US' },
    ],
  },
  {
    id: 'south-america',
    name: 'South America',
    description: 'Follow the southern hemisphere with a guided tour through every national flag.',
    countries: [
      { name: 'Argentina', code: 'AR' },
      { name: 'Bolivia', code: 'BO' },
      { name: 'Brazil', code: 'BR' },
      { name: 'Chile', code: 'CL' },
      { name: 'Colombia', code: 'CO' },
      { name: 'Ecuador', code: 'EC' },
      { name: 'Guyana', code: 'GY' },
      { name: 'Paraguay', code: 'PY' },
      { name: 'Peru', code: 'PE' },
      { name: 'Suriname', code: 'SR' },
      { name: 'Uruguay', code: 'UY' },
      { name: 'Venezuela', code: 'VE' },
    ],
  },
  {
    id: 'oceania',
    name: 'Oceania',
    description: 'Island-hop across the Pacific by generating every sovereign flag in Oceania.',
    countries: [
      { name: 'Australia', code: 'AU' },
      { name: 'Fiji', code: 'FJ' },
      { name: 'Kiribati', code: 'KI' },
      { name: 'Marshall Islands', code: 'MH' },
      { name: 'Micronesia', code: 'FM' },
      { name: 'Nauru', code: 'NR' },
      { name: 'New Zealand', code: 'NZ' },
      { name: 'Palau', code: 'PW' },
      { name: 'Papua New Guinea', code: 'PG' },
      { name: 'Samoa', code: 'WS' },
      { name: 'Solomon Islands', code: 'SB' },
      { name: 'Tonga', code: 'TO' },
      { name: 'Tuvalu', code: 'TV' },
      { name: 'Vanuatu', code: 'VU' },
    ],
  },
]

const CONTINENT_LOOKUP = CONTINENTS.reduce((accumulator, continent) => {
  accumulator[continent.id] = continent
  return accumulator
}, {})

const buildInitialEntries = () =>
  CONTINENTS.reduce((accumulator, continent) => {
    accumulator[continent.id] = continent.countries.map(createEntry)
    return accumulator
  }, {})

const buildInitialGenerationState = () =>
  CONTINENTS.reduce((accumulator, continent) => {
    accumulator[continent.id] = { running: false, completed: false }
    return accumulator
  }, {})

function FlagCard({ entry }) {
  const { country, dataUrl, error, prompt, status } = entry
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <header className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
          <ReactCountryFlag countryCode={country.code} svg title={`${country.name} reference flag`} className="text-2xl" />
          <span>{country.name}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Unicode reference flag for quick color checks.</p>
      </header>
      <div className="space-y-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
          <ReactCountryFlag countryCode={country.code} svg title={`${country.name} official flag`} className="block h-24 w-full" />
        </div>
        <div className="overflow-hidden rounded-xl border border-brand-200 bg-white p-2 text-center dark:border-brand-500/60 dark:bg-slate-900">
          {dataUrl ? (
            <img src={dataUrl} alt={`Generated ${country.name} flag`} className="h-24 w-full object-contain" loading="lazy" />
          ) : (
            <div className="flex h-24 items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
              {status === 'error' ? 'Generation failed' : status === 'loading' ? 'Loading flag…' : 'Pending request'}
            </div>
          )}
        </div>
      </div>
      <footer className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <p className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          {prompt || `Waiting to request the ${country.name} flag…`}
        </p>
        {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : null}
      </footer>
    </article>
  )
}

export default function FlagFoundryPage({ experience }) {
  const [entriesByContinent, setEntriesByContinent] = useState(buildInitialEntries)
  const [generationState, setGenerationState] = useState(buildInitialGenerationState)
  const apiBaseUrl = useMemo(() => {
    const url = experience?.svgApiBaseUrl || experience?.defaultBaseUrl || 'https://groq-endpoint.louispaulet13.workers.dev'
    return url.replace(/\/$/, '')
  }, [experience])

  const timeoutsRef = useRef({})
  const cancelledRef = useRef(false)
  const generationStateRef = useRef(generationState)

  const setTrackedGenerationState = useCallback((updater) => {
    setGenerationState((previous) => {
      const nextState = typeof updater === 'function' ? updater(previous) : updater
      generationStateRef.current = nextState
      return nextState
    })
  }, [])

  useEffect(() => {
    cancelledRef.current = false
    const timeouts = timeoutsRef.current

    return () => {
      cancelledRef.current = true
      Object.values(timeouts).forEach((timeoutId) => {
        if (timeoutId) clearTimeout(timeoutId)
      })
    }
  }, [])

  const updateEntry = useCallback((continentId, index, patch) => {
    setEntriesByContinent((previous) => {
      const continentEntries = previous[continentId] || []
      const nextEntries = continentEntries.map((entry, position) =>
        position === index ? { ...entry, ...patch } : entry
      )
      return { ...previous, [continentId]: nextEntries }
    })
  }, [])

  const runGenerationStep = useCallback(
    (continentId, index) => {
      const continent = CONTINENT_LOOKUP[continentId]
      if (!continent || cancelledRef.current) return

      if (index >= continent.countries.length) {
        setTrackedGenerationState((previous) => ({
          ...previous,
          [continentId]: { running: false, completed: true },
        }))
        timeoutsRef.current[continentId] = undefined
        return
      }

      const country = continent.countries[index]
      const requestPrompt = `Generate an accurate flat SVG of the national flag of ${country.name}. Respect the official proportions and palette.`

      updateEntry(continentId, index, { status: 'loading', prompt: requestPrompt, error: '', dataUrl: '' })

      ;(async () => {
        try {
          const requestUrl = new URL(`${apiBaseUrl}/svg/${encodeURIComponent(requestPrompt)}`)
          const response = await fetch(requestUrl.toString())
          if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
          const payload = await response.json()
          const dataUrl = buildDataUrl(payload)
          if (!dataUrl) throw new Error('The response did not include SVG markup.')

          updateEntry(continentId, index, {
            status: 'done',
            dataUrl,
            prompt: typeof payload?.prompt === 'string' && payload.prompt.trim() ? payload.prompt.trim() : requestPrompt,
          })
        } catch (error) {
          updateEntry(continentId, index, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Unexpected error while generating the flag.',
          })
        } finally {
          if (!cancelledRef.current) {
            timeoutsRef.current[continentId] = setTimeout(
              () => runGenerationStep(continentId, index + 1),
              LOAD_INTERVAL_MS,
            )
          }
        }
      })()
    },
    [apiBaseUrl, setTrackedGenerationState, updateEntry],
  )

  const startGeneration = useCallback(
    (continentId, { force = false } = {}) => {
      const continent = CONTINENT_LOOKUP[continentId]
      if (!continent) return

      const currentState = generationStateRef.current[continentId]
      if (currentState?.running && !force) return

      setEntriesByContinent((previous) => ({
        ...previous,
        [continentId]: continent.countries.map(createEntry),
      }))

      setTrackedGenerationState((previous) => ({
        ...previous,
        [continentId]: { running: true, completed: false },
      }))

      if (timeoutsRef.current[continentId]) clearTimeout(timeoutsRef.current[continentId])

      timeoutsRef.current[continentId] = setTimeout(() => runGenerationStep(continentId, 0), 200)
    },
    [runGenerationStep, setTrackedGenerationState],
  )

  useEffect(() => {
    startGeneration('europe')
  }, [startGeneration])

  const handleGenerateAll = useCallback(() => {
    CONTINENTS.forEach((continent) => {
      startGeneration(continent.id, { force: true })
    })
  }, [startGeneration])

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Global Flag Foundry</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Every continent is organized below. Europe auto-starts, while the others wait for your signal so you can pace API
              usage and savor the gallery fills.
            </p>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGenerateAll}
              className="inline-flex items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10 px-5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-brand-400/30 dark:bg-brand-400/10 dark:text-brand-200 dark:hover:bg-brand-400/20"
            >
              Generate every flag
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please remember API rate limits — this triggers hundreds of sequential calls, so let the queue finish before
              retrying.
            </p>
          </div>
        </div>
      </section>
      {CONTINENTS.map((continent) => {
        const continentEntries = entriesByContinent[continent.id] || []
        const state = generationState[continent.id] || { running: false, completed: false }
        const buttonLabel = state.running
          ? 'Generating…'
          : state.completed
            ? 'Regenerate flags'
            : continent.id === 'europe'
              ? 'Regenerate Europe'
              : `Generate ${continent.name}`

        return (
          <section
            key={continent.id}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{continent.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{continent.description}</p>
              </div>
              <button
                type="button"
                onClick={() => startGeneration(continent.id)}
                disabled={state.running}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:border-slate-700 dark:disabled:bg-slate-900/60 dark:disabled:text-slate-500"
              >
                {buttonLabel}
              </button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {continentEntries.map((entry) => (
                <FlagCard key={entry.country.code} entry={entry} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

