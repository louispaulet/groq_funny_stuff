export default function ExperiencePage({ experience, children }) {
  if (!experience) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
        Experience not found.
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br px-8 py-10 text-white shadow-lg ${experience.heroGradient}`}
      >
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs uppercase tracking-wide">
            {experience.badge}
          </span>
          <h1 className="text-3xl font-semibold sm:text-4xl">{experience.name}</h1>
          <p className="text-base text-white/90">{experience.headline}</p>
          <p className="text-sm text-white/80">{experience.description}</p>
        </div>
        <div className="absolute -right-20 bottom-0 top-0 w-64 bg-white/10 blur-3xl" aria-hidden />
      </section>

      <div>{children}</div>
    </div>
  )
}
