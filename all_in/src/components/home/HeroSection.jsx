import { Link } from 'react-router-dom'

export function HeroSection({
  highlights,
  stats,
  onBrowseExperiences,
  featuredExperience,
  featuredCtaLabel,
}) {
  return (
    <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 px-8 py-14 text-white shadow-2xl">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-white/20 blur-3xl" aria-hidden />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" aria-hidden />
      <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Groq AllIn Studio</p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Design, research, and play — every project in one inviting launchpad.
            </h1>
            <p className="text-base text-white/85 sm:text-lg">
              Spin up structured JSON briefs, cinematic Flux renders, diagramming consoles, and tongue-in-cheek pop-ups
              without leaving the Groq shell. Every workspace streams Groq-accelerated responses so you can iterate
              while ideas are hot.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onBrowseExperiences}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-600 shadow transition hover:bg-brand-50"
            >
              Browse experiences
              <span aria-hidden>→</span>
            </button>
            <Link
              to={featuredExperience.path}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
            >
              {featuredCtaLabel}
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </div>
        <div className="space-y-6 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-white/80">Why AllIn Studio?</h2>
          <ul className="space-y-5">
            {highlights.map((item) => (
              <li key={item.title} className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-white/80">{item.title}</p>
                <p className="text-sm leading-relaxed text-white/85">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative z-10 grid gap-4 pt-12 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/15 bg-white/10 p-5 text-left shadow-lg transition hover:border-white/25"
          >
            <p className="text-3xl font-semibold sm:text-4xl">{stat.value}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">{stat.label}</p>
            <p className="pt-2 text-sm text-white/80">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
