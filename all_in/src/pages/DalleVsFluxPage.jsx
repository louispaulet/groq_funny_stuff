import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const ITEMS_PER_PAGE = 10
const BASE_URL = import.meta.env.BASE_URL || '/'
const CSV_URL = `${BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`}data/dalle-flux-comparison.csv`

function parseCsv(text) {
  const rows = []
  let currentField = ''
  let currentRow = []
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        const peek = text[i + 1]
        if (peek === '"') {
          currentField += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      currentRow.push(currentField)
      currentField = ''
      continue
    }

    if (char === '\r') {
      continue
    }

    if (char === '\n') {
      currentRow.push(currentField)
      if (currentRow.some((value) => value !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentField = ''
      continue
    }

    currentField += char
  }

  if (inQuotes) {
    throw new Error('CSV parse error: unmatched quote')
  }

  currentRow.push(currentField)
  if (currentRow.some((value) => value !== '')) {
    rows.push(currentRow)
  }

  return rows
}

function parseComparisonCsv(text) {
  const rows = parseCsv(text)
  if (!rows.length) {
    return []
  }

  const header = rows[0].map((value) => value.trim().toLowerCase())
  const promptIndex = header.indexOf('prompt')
  const fluxIndex = header.indexOf('file_flux_url')
  const dalleIndex = header.indexOf('file_dalle_url')

  if (promptIndex === -1 || fluxIndex === -1 || dalleIndex === -1) {
    throw new Error('CSV header missing required columns')
  }

  const requiredIndex = Math.max(promptIndex, fluxIndex, dalleIndex)

  return rows
    .slice(1)
    .filter((row) => row.length > requiredIndex)
    .map((row) => ({
      prompt: row[promptIndex]?.trim() || '',
      fluxUrl: row[fluxIndex]?.trim() || '',
      dalleUrl: row[dalleIndex]?.trim() || '',
    }))
    .filter((entry) => entry.prompt && entry.fluxUrl && entry.dalleUrl)
}

function usePagination(items, itemsPerPage) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))

  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * itemsPerPage

  const pageItems = useMemo(
    () => items.slice(start, start + itemsPerPage),
    [items, start, itemsPerPage],
  )

  const goToPage = (nextPage) => {
    if (Number.isNaN(nextPage)) return
    const clamped = Math.min(Math.max(nextPage, 1), totalPages)
    setPage(clamped)
  }

  const goToPrevious = () => goToPage(currentPage - 1)
  const goToNext = () => goToPage(currentPage + 1)

  return {
    page: currentPage,
    totalPages,
    pageItems,
    goToPage,
    goToPrevious,
    goToNext,
  }
}

export default function DalleVsFluxPage() {
  const [comparisons, setComparisons] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCsv() {
      setStatus('loading')
      setErrorMessage('')

      try {
        const response = await fetch(CSV_URL, {
          headers: {
            Accept: 'text/csv',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to load CSV (status ${response.status})`)
        }

        const text = await response.text()
        const parsed = parseComparisonCsv(text)

        if (!cancelled) {
          setComparisons(parsed)
          setStatus('ready')
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('error')
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
        }
      }
    }

    loadCsv()

    return () => {
      cancelled = true
    }
  }, [])

  const { page, totalPages, pageItems, goToNext, goToPrevious } = usePagination(
    comparisons,
    ITEMS_PER_PAGE,
  )

  const isLoading = status === 'loading'
  const isError = status === 'error'
  const hasComparisons = comparisons.length > 0

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_65%)]" aria-hidden />
        <div className="relative z-10 space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">
            Side-by-side study
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            DALL·E 3 vs Flux Schnell
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            We captured a like-for-like benchmark using 186 prompts. Flux Schnell ran on GroqCloud’s free endpoint while DALL·E 3 used $30 of OpenAI credits. Explore the prompts, visuals, and stylistic differences below — each page streams ten comparisons for quick scanning.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 px-3 py-1 font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Flux Schnell · GroqCloud
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300">
              DALL·E 3 · OpenAI
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
            >
              Back to overview
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Prompt gallery</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Each prompt renders Flux Schnell (left) beside DALL·E 3 (right). Click an image to open the original export.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
            Page {page} of {totalPages}
          </div>
        </header>

        <div className="space-y-8">
          {isLoading && (
            <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Loading comparison dataset…
            </article>
          )}

          {isError && !isLoading && (
            <article className="space-y-3 rounded-3xl border border-rose-200/80 bg-rose-50/80 p-6 text-sm text-rose-700 shadow-sm dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200">
              <p className="font-semibold">We couldn’t load the CSV file.</p>
              <p>{errorMessage}</p>
            </article>
          )}

          {!isLoading && !isError && !hasComparisons && (
            <article className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              No comparisons are available yet. Check back soon.
            </article>
          )}

          {pageItems.map(({ prompt, fluxUrl, dalleUrl }, index) => (
            <article
              key={`${prompt}-${fluxUrl}`}
              className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <header className="space-y-2">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>
                    Prompt {index + 1 + (page - 1) * ITEMS_PER_PAGE}
                  </span>
                  <span aria-hidden>•</span>
                  <span>{prompt.length} characters</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{prompt}</p>
              </header>
              <div className="grid gap-6 lg:grid-cols-2">
                <figure className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-100/60 dark:border-emerald-400/30 dark:bg-slate-800/70">
                    <a href={fluxUrl} target="_blank" rel="noreferrer">
                      <img
                        src={fluxUrl}
                        alt={`Flux Schnell render for prompt: ${prompt}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                  <figcaption className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                    Flux Schnell — GroqCloud (free endpoint)
                  </figcaption>
                </figure>
                <figure className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-100/60 dark:border-indigo-400/30 dark:bg-slate-800/70">
                    <a href={dalleUrl} target="_blank" rel="noreferrer">
                      <img
                        src={dalleUrl}
                        alt={`DALL·E 3 render for prompt: ${prompt}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                  <figcaption className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                    DALL·E 3 — OpenAI (paid usage)
                  </figcaption>
                </figure>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={goToPrevious}
            disabled={page === 1 || isLoading || !hasComparisons}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-600 transition enabled:hover:border-brand-500 enabled:hover:bg-brand-500/10 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:enabled:hover:border-brand-400/60 dark:enabled:hover:bg-brand-500/10"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={goToNext}
            disabled={page === totalPages || isLoading || !hasComparisons}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-600 transition enabled:hover:border-brand-500 enabled:hover:bg-brand-500/10 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:enabled:hover:border-brand-400/60 dark:enabled:hover:bg-brand-500/10"
          >
            Next →
          </button>
        </div>
      </section>
    </div>
  )
}
