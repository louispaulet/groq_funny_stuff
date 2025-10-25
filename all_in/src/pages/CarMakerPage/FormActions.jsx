import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline'

export default function FormActions({ loading, onClearGallery }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:cursor-not-allowed disabled:bg-brand-400"
      >
        {loading ? (
          <>
            <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            Generating…
          </>
        ) : (
          'Generate car image'
        )}
      </button>

      <button
        type="button"
        onClick={onClearGallery}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-red-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 dark:border-slate-600 dark:text-slate-300"
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
        Clear gallery
      </button>
    </div>
  )
}
