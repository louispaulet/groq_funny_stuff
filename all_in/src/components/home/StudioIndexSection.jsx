import { Link } from 'react-router-dom'
import ExperienceCard from './ExperienceCard'
import { gameOfLifeLabDetails, gameOfLifeLabTags } from '../../content/gameOfLifeLab'

export function StudioIndexSection({ experiences, detailedCopyById, tagsById }) {
  return (
    <section id="experience-index" className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
          Studio index
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Explore every workspace in depth
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Long-form briefs, embedded galleries, and structured prompts give each project its own personality. Browse
          the full roster and pick the copilots that match your next build.
        </p>
      </header>
      <div className="grid gap-8 xl:grid-cols-2">
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            detailedCopy={detailedCopyById[experience.id] ?? <p>{experience.description}</p>}
            tags={tagsById[experience.id] ?? []}
          />
        ))}
        <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/90">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/20 via-cyan-500/20 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden />
          <div className="relative space-y-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-2">
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" aria-hidden />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Game of Life Lab</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800 dark:bg-sky-500/20 dark:text-sky-200">
                Lab
              </span>
              <Link
                to="/game-of-life-lab"
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-400/60 dark:hover:bg-sky-500/10"
              >
                Enter workspace
                <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Explore Conway&apos;s classic automaton with live controls, toroidal wrap, and curated presets.
            </p>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {gameOfLifeLabDetails}
            </div>
            {gameOfLifeLabTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {gameOfLifeLabTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Toroidal wrap • Live controls • Preset seeds
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
