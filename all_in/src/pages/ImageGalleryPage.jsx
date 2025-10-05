import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearImageHistory, readImageHistory } from '../lib/imageHistoryCookie'

const PAGE_SIZE = 12

export default function ImageGalleryPage() {
  const [entries, setEntries] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

  const refreshHistory = useCallback(() => {
    setEntries(readImageHistory())
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  useEffect(() => {
    setVisibleCount((current) => {
      if (entries.length === 0) return PAGE_SIZE
      const next = Math.max(PAGE_SIZE, current)
      return Math.min(next, entries.length)
    })
  }, [entries.length])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleFocus = () => refreshHistory()
    window.addEventListener('focus', handleFocus)

    let handleVisibilityChange
    if (typeof document !== 'undefined') {
      handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshHistory()
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      window.removeEventListener('focus', handleFocus)
      if (handleVisibilityChange && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [refreshHistory])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return undefined
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setVisibleCount(entries.length)
      return undefined
    }

    const observer = new IntersectionObserver((observerEntries) => {
      observerEntries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleCount((current) => Math.min(current + PAGE_SIZE, entries.length))
        }
      })
    })

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [entries.length])

  const visibleEntries = useMemo(() => entries.slice(0, visibleCount), [entries, visibleCount])
  const hasEntries = entries.length > 0
  const hasMore = visibleCount < entries.length

  function handleClearHistory() {
    clearImageHistory()
    setEntries([])
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Saved image gallery</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse every image saved to your browser cookie. Scroll to load more or refresh after generating new art.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/imagegen"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-brand-400 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            Back to generator
          </Link>
          <button
            type="button"
            onClick={refreshHistory}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-sky-400 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            Refresh
          </button>
          {hasEntries ? (
            <button
              type="button"
              onClick={handleClearHistory}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </header>

      {hasEntries ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEntries.map((entry) => (
              <article
                key={`${entry.url}-${entry.timestamp}`}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={entry.url} alt={entry.prompt || 'Generated image'} className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {entry.prompt || 'Saved image'}
                  </h2>
                  {entry.timestamp ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  ) : null}
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:border-sky-400 hover:text-sky-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  >
                    Open original
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div ref={sentinelRef} className="h-8 w-full" aria-hidden />
          {!hasMore ? (
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">You&apos;ve reached the end of your saved images.</p>
          ) : null}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          No saved images yet. Generate something new and it will appear here automatically.
        </div>
      )}
    </div>
  )
}

