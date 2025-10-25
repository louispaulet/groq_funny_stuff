export default function CarMakerGallery({ gallery, limit, formatTimestamp }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Car gallery</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">Recent renders are stored in a cookie on this device.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {gallery.length}/{limit}
        </span>
      </header>
      {gallery.length > 0 ? (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {gallery.map((entry) => (
            <li key={entry.url} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
              <img
                src={entry.url}
                alt="Saved hero car render"
                className="h-32 w-full rounded-xl border border-slate-200 object-cover shadow-sm sm:h-24 sm:w-40 dark:border-slate-700"
              />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{entry.summary}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{entry.prompt}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Saved {formatTimestamp(entry.timestamp)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Generate a car to begin filling your gallery.</p>
      )}
    </section>
  )
}
