import { Link } from 'react-router-dom'

const FALLBACK_GRADIENT = 'from-slate-500 to-slate-700'
const FALLBACK_BADGE_STYLE = 'bg-slate-100 text-slate-900 dark:bg-slate-500/20 dark:text-slate-200'

export default function ExperienceCard({ experience, detailedCopy, tags }) {
  if (!experience) {
    return null
  }

  const gradient = experience.heroGradient ? experience.heroGradient : FALLBACK_GRADIENT
  const badgeStyle = experience.panelAccent ? experience.panelAccent : FALLBACK_BADGE_STYLE
  const tagList = Array.isArray(tags) ? tags : []
  const modelOptions = Array.isArray(experience.modelOptions) ? experience.modelOptions : []

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-20 right-0 h-48 w-48 rounded-full bg-gradient-to-br ${gradient} opacity-25 blur-3xl transition duration-500 group-hover:opacity-60`} />
        <div className={`absolute -bottom-24 left-12 h-40 w-40 rounded-full bg-gradient-to-tr ${gradient} opacity-10 blur-3xl transition duration-500 group-hover:opacity-40`} />
      </div>
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-2">
            <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${gradient}`} aria-hidden />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{experience.badge}</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{experience.name}</h3>
            </div>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeStyle}`}>
            {experience.headline}
          </span>
          <Link
            to={experience.path}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800"
          >
            Enter
            <span aria-hidden>→</span>
          </Link>
        </div>
        <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{experience.description}</p>
        <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detailedCopy}</div>
        {tagList.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {tagList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {modelOptions.length > 0 ? (
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
            {modelOptions.join(' • ')}
          </p>
        ) : null}
      </div>
    </article>
  )
}
