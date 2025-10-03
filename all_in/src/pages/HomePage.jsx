import { Link } from 'react-router-dom'
import { experiences } from '../config/experiences'

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 px-8 py-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">Groq Playground</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">All experiences under one roof.</h1>
          <p className="text-base text-white/90">
            Explore specialized assistants for nutrition, 3D printing, and Pokemon knowledge with a unified design and faster workflow.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {experiences.map((experience) => (
              <Link
                key={experience.id}
                to={experience.path}
                className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
              >
                {experience.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </section>

      <section>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Specialized workspaces</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Each workspace shares the same chat shell but tunes prompts, helpers, and visuals for the job.
            </p>
          </div>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {experiences.map((experience) => (
            <article
              key={experience.id}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div className="space-y-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${experience.panelAccent}`}>
                  {experience.badge}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{experience.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                <Link
                  to={experience.path}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition group-hover:border-brand-500 group-hover:text-brand-600 dark:border-slate-700 dark:text-slate-200"
                >
                  Open workspace
                  <span aria-hidden>→</span>
                </Link>
                <span className="text-xs">{experience.modelOptions[0]}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
