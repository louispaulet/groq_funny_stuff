import { useEffect, useMemo, useState } from 'react'
import ReactCountryFlag from 'react-country-flag'

const EUROPEAN_TOP_TEN = [
  { name: 'Russia', code: 'RU' }, { name: 'Germany', code: 'DE' },
  { name: 'United Kingdom', code: 'GB' }, { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' }, { name: 'Spain', code: 'ES' },
  { name: 'Ukraine', code: 'UA' }, { name: 'Poland', code: 'PL' },
  { name: 'Romania', code: 'RO' }, { name: 'Netherlands', code: 'NL' },
]

const LOAD_INTERVAL_MS = 1000
const createEntry = (country) => ({ country, status: 'idle', prompt: '', dataUrl: '', error: '' })
const buildDataUrl = (payload) => {
  const inline = typeof payload?.dataUrl === 'string' ? payload.dataUrl.trim() : ''
  if (inline.startsWith('data:image/svg+xml')) return inline
  const svgMarkup = typeof payload?.svg === 'string' ? payload.svg.trim() : ''
  return svgMarkup ? `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}` : ''
}

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
  const [entries, setEntries] = useState(() => EUROPEAN_TOP_TEN.map(createEntry))
  const apiBaseUrl = useMemo(() => {
    const url = experience?.svgApiBaseUrl || experience?.defaultBaseUrl || 'https://groq-endpoint.louispaulet13.workers.dev'
    return url.replace(/\/$/, '')
  }, [experience])

  useEffect(() => {
    let cancelled = false
    let timeoutId
    const patchEntry = (index, patch) => setEntries((prev) => prev.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)))

    async function loadFlag(index) {
      if (cancelled || index >= EUROPEAN_TOP_TEN.length) return
      const country = EUROPEAN_TOP_TEN[index]
      const requestPrompt = `Generate an accurate flat SVG of the national flag of ${country.name}. Respect the official proportions and palette.`
      patchEntry(index, { status: 'loading', prompt: requestPrompt, error: '', dataUrl: '' })
      try {
        const requestUrl = new URL(`${apiBaseUrl}/svg/${encodeURIComponent(requestPrompt)}`)
        const response = await fetch(requestUrl.toString())
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
        const payload = await response.json()
        const dataUrl = buildDataUrl(payload)
        if (!dataUrl) throw new Error('The response did not include SVG markup.')

        patchEntry(index, {
          status: 'done',
          dataUrl,
          prompt: typeof payload?.prompt === 'string' && payload.prompt.trim() ? payload.prompt.trim() : requestPrompt,
        })
      } catch (error) {
        patchEntry(index, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unexpected error while generating the flag.',
        })
      } finally {
        if (!cancelled) {
          timeoutId = setTimeout(() => loadFlag(index + 1), LOAD_INTERVAL_MS)
        }
      }
    }

    timeoutId = setTimeout(() => loadFlag(0), 200)

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [apiBaseUrl])

  return (
    <div className="space-y-8">
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">European flag roll call</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">We stream prompts into the <code className="rounded bg-slate-100 px-1 py-0.5 text-[0.7rem] text-slate-700 dark:bg-slate-800 dark:text-slate-200">/svg</code> worker route one second apart so the gallery fills gradually alongside a Unicode flag reference.</p>
      </section>
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <FlagCard key={entry.country.code} entry={entry} />
        ))}
      </section>
    </div>
  )
}

