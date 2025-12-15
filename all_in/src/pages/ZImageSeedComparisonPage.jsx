import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const ITEMS_PER_PAGE = 10
const BASE_URL = import.meta.env.BASE_URL || '/'
const CSV_URL = `${BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`}data/z-image-seed-comparison.csv`

function sanitizeFilenameSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

function buildDownloadFilename(url, prompt, label) {
  let extension = 'png'
  try {
    const path = new URL(url).pathname
    const lastDot = path.lastIndexOf('.')
    if (lastDot !== -1 && lastDot < path.length - 1) {
      extension = path.slice(lastDot + 1)
    }
  } catch {
    // Ignore URL parsing failures and use the default extension
  }

  const baseName = sanitizeFilenameSegment(prompt).slice(0, 48) || 'artwork'
  const labelSegment = sanitizeFilenameSegment(label)
  const prefix = labelSegment ? `${labelSegment}-` : ''
  return `${prefix}${baseName}.${extension}`
}

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
  const seedAIndex = header.indexOf('file_flux_url')
  const seedBIndex = header.indexOf('file_dalle_url')
  const categoryIndex = header.indexOf('category')

  if (promptIndex === -1 || seedAIndex === -1 || seedBIndex === -1) {
    throw new Error('CSV header missing required columns')
  }

  const requiredIndex = Math.max(promptIndex, seedAIndex, seedBIndex)

  return rows
    .slice(1)
    .filter((row) => row.length > requiredIndex)
    .map((row) => {
      const categoryValue =
        categoryIndex !== -1 && row.length > categoryIndex ? row[categoryIndex] : ''
      return {
        prompt: row[promptIndex]?.trim() || '',
        seedAUrl: row[seedAIndex]?.trim() || '',
        seedBUrl: row[seedBIndex]?.trim() || '',
        category: categoryValue?.trim() || 'Uncategorized',
      }
    })
    .filter((entry) => entry.prompt && entry.seedAUrl && entry.seedBUrl)
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

export default function ZImageSeedComparisonPage() {
  const [comparisons, setComparisons] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [downloadingUrl, setDownloadingUrl] = useState('')

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

  const categories = useMemo(() => {
    const unique = new Set()
    comparisons.forEach(({ category }) => {
      const normalized = (category || '').trim()
      if (normalized) {
        unique.add(normalized)
      }
    })
    return Array.from(unique)
  }, [comparisons])

  useEffect(() => {
    if (selectedCategory !== 'all' && !categories.includes(selectedCategory)) {
      setSelectedCategory('all')
    }
  }, [categories, selectedCategory])

  const filteredComparisons = useMemo(() => {
    if (selectedCategory === 'all') {
      return comparisons
    }
    return comparisons.filter(({ category }) => category === selectedCategory)
  }, [comparisons, selectedCategory])

  const { page, totalPages, pageItems, goToPage, goToNext, goToPrevious } = usePagination(
    filteredComparisons,
    ITEMS_PER_PAGE,
  )

  const handleCategoryChange = (event) => {
    const nextCategory = event.target.value
    setSelectedCategory(nextCategory)
    goToPage(1)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    goToNext()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleDownload = async (url, prompt, sourceLabel) => {
    if (!url) return
    setDownloadingUrl(url)
    try {
      const response = await fetch(url, {
        mode: 'cors',
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error(`Failed to download image (status ${response.status})`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = buildDownloadFilename(url, prompt, sourceLabel)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Failed to download image', error)
    } finally {
      setDownloadingUrl('')
    }
  }

  const totalFiltered = filteredComparisons.length
  const isLoading = status === 'loading'
  const isError = status === 'error'
  const hasAnyComparisons = comparisons.length > 0
  const hasFilteredComparisons = totalFiltered > 0

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 px-8 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_65%)]" aria-hidden />
        <div className="relative z-10 space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-300">
            Seed A vs Seed B
          </p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            z-image seed comparison lab
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Each prompt is rendered twice with different seeds from the z-image generator. Browse side-by-side outputs, filter by category, and download the originals for deeper inspection.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 px-3 py-1 font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
              Seed A
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300">
              Seed B
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 font-semibold text-slate-600 transition hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
            >
              Back to overview
              <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Prompt gallery</h2>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Seed A sits on the left, Seed B on the right. Click to view the full-resolution export.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Category
              </span>
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="min-w-[12rem] rounded-full border border-transparent bg-white/80 px-3 py-1 text-sm font-medium text-slate-700 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:bg-slate-900/60 dark:text-slate-100 dark:focus:border-brand-400"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-flex flex-nowrap items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
              <span className="whitespace-nowrap">
                Page {page} of {totalPages}
              </span>
              <span aria-hidden>-</span>
              <span className="whitespace-nowrap">{totalFiltered} prompts</span>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {isLoading && (
            <article className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              Loading comparison dataset...
            </article>
          )}

          {isError && !isLoading && (
            <article className="space-y-3 rounded-3xl border border-rose-200/80 bg-rose-50/80 p-6 text-sm text-rose-700 shadow-sm dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200">
              <p className="font-semibold">We couldn't load the CSV file.</p>
              <p>{errorMessage}</p>
            </article>
          )}

          {!isLoading && !isError && !hasAnyComparisons && (
            <article className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              No comparisons are available yet. Check back soon.
            </article>
          )}

          {!isLoading && !isError && hasAnyComparisons && !hasFilteredComparisons && (
            <article className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700 shadow-sm dark:border-amber-600/60 dark:bg-amber-900/30 dark:text-amber-200">
              <p className="font-semibold">No prompts match this category.</p>
              <p>Try selecting a different category to continue exploring the comparison set.</p>
            </article>
          )}

          {pageItems.map(({ prompt, seedAUrl, seedBUrl, category }, index) => (
            <article
              key={`${prompt}-${seedAUrl}`}
              className="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <header className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>
                    Prompt {index + 1 + (page - 1) * ITEMS_PER_PAGE}
                  </span>
                  <span aria-hidden>-</span>
                  <span>{prompt.length} characters</span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {category}
                </span>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{prompt}</p>
              </header>
              <div className="grid gap-6 lg:grid-cols-2">
                <figure className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-emerald-500/40 bg-slate-100/60 dark:border-emerald-400/30 dark:bg-slate-800/70">
                    <a href={seedAUrl} target="_blank" rel="noreferrer">
                      <img
                        src={seedAUrl}
                        alt={`Seed A render for prompt: ${prompt}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                  <figcaption className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">Seed A</span>
                      <button
                        type="button"
                        onClick={() => handleDownload(seedAUrl, prompt, 'seed-a')}
                        disabled={downloadingUrl === seedAUrl}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-slate-600 transition hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                        aria-label="Download Seed A image"
                      >
                        {downloadingUrl === seedAUrl ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  </figcaption>
                </figure>
                <figure className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-indigo-500/40 bg-slate-100/60 dark:border-indigo-400/30 dark:bg-slate-800/70">
                    <a href={seedBUrl} target="_blank" rel="noreferrer">
                      <img
                        src={seedBUrl}
                        alt={`Seed B render for prompt: ${prompt}`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </a>
                  </div>
                  <figcaption className="text-xs uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">Seed B</span>
                      <button
                        type="button"
                        onClick={() => handleDownload(seedBUrl, prompt, 'seed-b')}
                        disabled={downloadingUrl === seedBUrl}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-slate-600 transition hover:border-brand-500 hover:bg-brand-500/10 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                        aria-label="Download Seed B image"
                      >
                        {downloadingUrl === seedBUrl ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
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
            disabled={page === 1 || isLoading || !hasFilteredComparisons}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-600 transition enabled:hover:border-brand-500 enabled:hover:bg-brand-500/10 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:enabled:hover:border-brand-400/60 dark:enabled:hover:bg-brand-500/10"
          >
            &larr; Previous
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={page === totalPages || isLoading || !hasFilteredComparisons}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 font-medium text-slate-600 transition enabled:hover:border-brand-500 enabled:hover:bg-brand-500/10 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:enabled:hover:border-brand-400/60 dark:enabled:hover:bg-brand-500/10"
          >
            Next &rarr;
          </button>
        </div>
      </section>
    </div>
  )
}
