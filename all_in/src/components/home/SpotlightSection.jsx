import { Link } from 'react-router-dom'

export function SpotlightSection({ spotlights }) {
  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Spotlights</p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Fresh drops and featured experiments
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          These rotating highlights surface the latest utilities, research labs, and satire-filled sandboxes built on
          Groq. Explore them to feel how each idea pushes the shared Studio shell in a new direction.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {spotlights.map((spotlight) => (
          <article
            key={spotlight.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${spotlight.accent} opacity-0 transition duration-500 group-hover:opacity-100`}
              aria-hidden
            />
            <div className="relative space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-100/10 dark:text-slate-300">
                  {spotlight.eyebrow}
                </span>
                <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-300">
                  {spotlight.badge}
                </span>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{spotlight.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{spotlight.description}</p>
              </div>
              <Link
                to={spotlight.to}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
              >
                {spotlight.cta}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
