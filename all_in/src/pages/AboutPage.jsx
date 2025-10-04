import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-700 to-indigo-600 px-8 py-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">About Groq AllIn Studio</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Louis Paulet&apos;s Groq playground</h1>
          <p className="text-base text-white/90">
            Groq AllIn Studio is a side project by Louis Paulet, Data Scientist at Checkout.com, built to stretch the GroqCloud
            free tier and explore how far a single worker-backed chat experience can go.
          </p>
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white"
          >
            Back to Overview
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Frontend studio</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The <code>all_in/</code> workspace is the production React shell that unifies the Pokédex, AllergyFinder, STL Viewer,
            and Object Maker experiences for deployment. It is the only project that ships live, while reusing shared chat and UI
            components across each tab.
          </p>
        </article>
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Cloudflare worker backend</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            A dedicated Cloudflare Worker powers the Groq backend. Every chat in the studio tunnels through this worker, which
            enriches prompts with tools like OpenFoodFacts lookups before relaying Groq responses.
          </p>
        </article>
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Legacy sandboxes</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            The other folders in the repo keep the original standalone demos—AllergyFinder, STL Viewer, Remote Chat, and the
            Pokédex—so fixes can be tested in isolation before being folded back into the studio.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Why the worker matters</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Louis designed the worker to carry its own intelligence. Beyond proxying Groq models, it can query product data when a
          chat session asks about allergens, providing the same OpenFoodFacts evidence that powers the dedicated AllergyFinder
          experience.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The Object Maker tooling leans on the worker too: schema brainstorming happens through the chat endpoint, then the
          structured output endpoint turns those schemas into real JSON objects.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Supported worker routes</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-200">POST /chat</span> — primary endpoint used by every
            experience. The frontend appends <code>/chat</code> to the configured base URL and sends OpenAI-style chat payloads;
            the worker can augment requests with product lookups before returning Groq responses.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-200">GET /flavor-finder/&lt;food&gt;</span> — helper route
            that fetches OpenFoodFacts entries directly, useful for debugging the worker&apos;s ingredient sourcing without spinning
            up the UI.
          </li>
          <li>
            <span className="font-semibold text-slate-800 dark:text-slate-200">POST /obj/&lt;type&gt; (and /object*/ variants)</span> —
            structured generation endpoint consumed by Object Maker. It accepts a JSON schema, user prompt, and optional model
            parameters, then returns a compliant object.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Keep an eye on the other repo folders for historical implementations of each feature—the worker is the glue that keeps
          them coherent inside Groq AllIn Studio.
        </p>
      </section>
    </div>
  )
}
