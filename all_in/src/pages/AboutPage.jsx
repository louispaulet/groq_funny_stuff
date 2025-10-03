import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-700 to-indigo-600 px-8 py-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">About Groq AllIn Studio</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Crafting a playful control room for every Groq chat 🤝</h1>
          <p className="text-base text-white/90">
            Groq AllIn Studio bundles our favorite assistants into one friendly workspace so you can hop between allergy lookups, STL previews, and Pokédex lore without losing your flow.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
          >
            Back to Overview
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Why a studio? 🚀</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Each demo started as a standalone sandbox. Merging them into Groq AllIn Studio lets us reuse the snappy chat shell, keep credentials in one place, and move faster when we tweak prompts or models.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            You still have access to the individual projects for deep debugging, but the studio is our north star for daily work and deployment.
          </p>
        </article>
        <article className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Team workflow 🛠️</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            With a single Vite workspace, we share design tokens, testing helpers, and chat plumbing. Shipping updates means touching one code path, one deployment pipeline, and one set of docs.
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Need to debug? Drop to the legacy folders, then bubble the fix back up. Need to demo? Run the studio and the experience is ready in seconds ⚡️.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Design vibes 🎨</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We wanted the studio to feel like a familiar cockpit with a little wink. That means cozy gradients, rounded surfaces, and intentional whitespace so conversations never feel cramped.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>🌈 Shared color tokens keep AllergyFinder, STL Viewer, and the Pokédex distinct without jarring swaps.</li>
          <li>🧭 Navigation hugs the top so you can jump tabs muscle-memory style, no matter the screen size.</li>
          <li>😄 The logo spells "llI" because that trio of lines makes us grin every time—playful branding on a serious engine.</li>
          <li>⚡️ Micro-interactions (hover lifts, quick fades) help you sense responsiveness even before the model replies.</li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The goal: helpful, fast, and just whimsical enough that you remember which tab you were in when inspiration hit ✨.
        </p>
      </section>
    </div>
  )
}
