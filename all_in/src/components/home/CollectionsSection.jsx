import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

export const CollectionsSection = forwardRef(function CollectionsSection({ categories, experienceLookup }, ref) {
  return (
    <section ref={ref} id="experience-collections" className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Collections
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Choose the flow that fits your next sprint
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Each collection bundles experiences that share a mindset — from structured schema builders to image-first
          ateliers. Jump in through a category or dive straight into a workspace.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"
          >
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{category.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{category.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {category.experienceIds
                  .map((experienceId) => experienceLookup[experienceId])
                  .filter(Boolean)
                  .map((experience) => (
                    <Link
                      key={experience.id}
                      to={experience.path}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                    >
                      <span>{experience.name}</span>
                      <span aria-hidden>↗</span>
                    </Link>
                  ))}
                {(category.extraLinks ?? []).map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                  >
                    <span>{link.name}</span>
                    <span aria-hidden>↗</span>
                  </Link>
                ))}
                {category.id === 'play' ? (
                  <Link
                    to="/game-of-life-lab"
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                  >
                    <span>Game of Life Lab</span>
                    <span aria-hidden>↗</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
})
