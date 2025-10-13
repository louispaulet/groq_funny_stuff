import { Link } from 'react-router-dom'

const workerRoutes = [
  {
    method: 'POST',
    path: '/chat',
    badge: 'Conversational core',
    description:
      'Primary endpoint used by every experience. The frontend appends /chat to the configured base URL and sends OpenAI-style chat payloads; the worker can augment requests with product lookups before returning Groq responses.',
    emoji: '💬',
  },
  {
    method: 'GET',
    path: '/flavor-finder/<foodOrBarcode>',
    badge: 'Allergy scout',
    description:
      "Helper route that fetches allergy metadata on demand, perfect for debugging the worker's ingredient sourcing without loading the full UI.",
    emoji: '🔎',
  },
  {
    method: 'GET',
    path: '/news/<category>',
    badge: 'Curated headlines',
    description:
      'Curated newsfeed powering the News Analyzer experience. The worker aggregates trusted sources per category and returns normalized JSON so the UI can render headlines instantly.',
    emoji: '🗞️',
  },
  {
    method: 'GET',
    path: '/svg/<prompt> & /svg_deluxe/<prompt>',
    badge: 'Vector foundry',
    description:
      'SVG rendering routes used by the Prompt Lab and Flag Foundry. /svg streams Llama 3 inline markup, while /svg_deluxe taps oss-120B for high-token animated canvases.',
    emoji: '🧵',
  },
  {
    method: 'GET',
    path: '/flux/<prompt>',
    badge: 'Visual studio',
    description:
      "Image generator backing Pizza Maker, Car Maker, and the Flux playground. The worker orchestrates Groq's Flux models and normalizes the resulting gallery payloads.",
    emoji: '🖼️',
  },
  {
    method: 'POST',
    path: '/obj/<type> (and /object*/ variants)',
    badge: 'Structured maker',
    description:
      'Structured generation endpoint consumed by Object Maker. It accepts a JSON schema, user prompt, and optional model parameters, then returns a compliant object.',
    emoji: '🧩',
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-brand-700 to-indigo-600 px-8 py-12 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-white/70">About Groq AllIn Studio</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Louis Paulet&apos;s Groq AllIn Studio 🤝</h1>
          <p className="text-base text-white/90">
            Groq AllIn Studio is a personal initiative by Louis Paulet, Data Scientist at Checkout.com. The project explores
            how GroqCloud services can support focused conversational tools while complementing his production work. Each
            module tests practical applications, latency-sensitive interfaces, and the supporting infrastructure required to
            run them responsibly. 🔍
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">1. Frontend studio 🖥️</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
             The <code>all_in/</code> workspace is the production React shell that unifies the Pokédex, AllergyFinder, STL Viewer,
            and Object Maker experiences for deployment. It is the only project that ships live, while reusing shared chat and UI
            components across each tab.
          </p>
        </article>
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">2. Cloudflare worker backend ☁️</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            ☁️ A dedicated Cloudflare Worker powers the Groq backend. Every chat in the studio tunnels through this worker, which
            enriches prompts with tools like product lookups before relaying Groq responses.
          </p>
        </article>
        <article className="space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">3. Applied research space 🧪</h2>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            🔬 The studio hosts a rotating set of exploratory prompts and prototypes that examine new interaction patterns. It is
            the venue for trying emerging Groq capabilities, refining responsible guardrails, and translating lessons back into
            production-quality solutions.
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Why the worker matters 🛠️</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Louis designed the worker to carry its own intelligence. Beyond proxying Groq models, it can query product data when a
          chat session asks about allergens, providing the same product evidence that powers the dedicated AllergyFinder
          experience. 🧠
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          The Object Maker tooling leans on the worker too: schema brainstorming happens through the chat endpoint, then the
          structured output endpoint turns those schemas into real JSON objects. 🧾
        </p>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-indigo-900 to-brand-700 p-8 text-white shadow-xl dark:border-slate-800">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Worker capabilities</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Supported worker routes 🚦</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Always-on tunnel to GroqCloud
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80">
            Each route is tuned for a specialized job—from conversational routing to asset generation—so experiments feel crisp
            without any custom wiring. Tap into them directly or through the studio experiences to unlock the same low-latency magic.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workerRoutes.map((route) => (
              <div
                key={route.path}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-semibold uppercase tracking-widest text-white">
                    {route.method}
                  </span>
                  <span className="text-xl" aria-hidden="true">
                    {route.emoji}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold text-white">{route.path}</p>
                <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
                  <span className="h-1 w-6 rounded-full bg-brand-300/60 transition-all duration-300 group-hover:w-12 group-hover:bg-brand-200" />
                  {route.badge}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{route.description}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm leading-relaxed text-white/80">
            The worker keeps each experiment consistent, ensuring the studio remains reliable even as new ideas are introduced. 📈
          </p>
        </div>
      </section>


    </div>
  )
}
