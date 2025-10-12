import { Link } from 'react-router-dom'
import { SparklesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { cursedMarketInventory } from '../config/cursedMarket'

export default function SecondHandFoodMarketPage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-brand-600 px-8 py-14 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_55%)]" aria-hidden />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              <SparklesIcon className="h-4 w-4" aria-hidden />
              Pop-Up Market
            </p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Second-Hand Food Market</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85">
              Welcome to the dystopian deli counter where hygiene laws dare not tread. Each pre-loved delicacy arrives with a
              bespoke curse, a suspicious backstory, and a non-refundable price tag. Shop fast—before the health inspector finds us.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow transition hover:bg-brand-50"
              >
                Back to overview
                <span aria-hidden>→</span>
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                Curses complimentary
              </span>
            </div>
          </div>
          <div className="relative hidden h-full lg:flex">
            <div className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/10 p-6 shadow-lg backdrop-blur">
              <div className="absolute -top-10 right-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <div className="space-y-4 text-sm text-white/90">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  <ExclamationTriangleIcon className="h-4 w-4" aria-hidden />
                  Certified Questionable
                </div>
                <p>
                  Groq’s procurement goblins scoured back-alley buffets and underground potlucks to curate this ethically dubious
                  tasting menu. Each item ships in a suspicious paper bag alongside a legal waiver scented with despair.
                </p>
                <p>
                  Pro tip: pair with a tetanus shot and a strong stomach. Returns politely redirected to the nearest void.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <header className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Tonight’s questionable specials 🛒</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Every listing comes with the seller’s original fingerprints, unresolved drama, and an enthusiastic “Buy Now” button that
            doesn’t actually do anything. Please enjoy responsibly—or at least ironically.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cursedMarketInventory.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-sm transition hover:border-brand-400/60 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/95"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-slate-900/80">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4 text-xs uppercase tracking-[0.3em] text-white/75">
                  {item.curse}
                </div>
              </div>
              <div className="flex flex-1 flex-col space-y-4 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{item.price}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-700 transition hover:border-brand-500 hover:bg-brand-500/20 dark:text-brand-300"
                  >
                    Buy Now
                    <span aria-hidden>→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Satisfaction not guaranteed</h2>
            <p>
              By tapping any button above, you agree to our 48-page End-Of-Taste waiver, accept that flavor timelines are non-linear,
              and acknowledge that cursed calories still count. Remember: if it looks haunted, it probably is.
            </p>
            <p>
              Need palate cleanser recommendations after this experience? Swing by AllergyFinder or Pizza Maker for something less
              contaminated. Maybe.
            </p>
          </div>
          <div className="rounded-2xl border border-dashed border-brand-500/50 bg-brand-50/60 p-6 text-brand-700 dark:border-brand-400/50 dark:bg-brand-500/10 dark:text-brand-200">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em]">Menu JSON</h3>
            <p className="mt-2 text-sm">
              Import this cursed catalogue into Object Maker at your own risk. Side effects include laughter, discomfort, and sudden
              urges to disinfect your soul.
            </p>
            <pre className="mt-4 max-h-52 overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs text-emerald-200">
              {JSON.stringify(
                cursedMarketInventory.map(({ title, description, price, image }) => ({ title, description, price, image })),
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </section>
    </div>
  )
}
