import { Link } from 'react-router-dom'
import { experiences } from '../config/experiences'

const detailedCopyById = {
  allergyfinder: (
    <>
      <p>
        🛡️ AllergyFinder taps into Open Food Facts so it can examine ingredient panels in context. Bring your saved allergen
        profile into the conversation and the assistant highlights risky ingredients, suggests safe alternatives, and drafts
        grocery lists that respect your preferences. Transparency comes first: responses call out when product data is
        missing or when you should double-check real-world packaging. 🧾
      </p>
      <p>
        Use it for meal planning, quick label triage, or inspiration when you are cooking for friends with different dietary
        needs. Because it runs on Groq-accelerated LLMs, you get near-instant summaries even for lengthy ingredient lists. 🚀
      </p>
    </>
  ),
  imagegen: (
    <>
      <p>
        🎬 Flux Image Lab sends prompts directly to Groq-hosted Flux endpoints and streams back high-fidelity renders within a
        heartbeat. Dial in lens styles, lighting, and art direction while the assistant suggests extra flourish—think props,
        color palettes, or camera modifiers that make the output pop. Every render lands in a sticky gallery so you can remix a
        prior shot with one click. 🖼️
      </p>
      <p>
        The workspace is tuned for creative sprints: it keeps your last prompt ready, exposes seed values for reproducibility,
        and exports image metadata for downstream pipelines. Whether you are art directing concept pieces or prototyping
        marketing visuals, Flux Image Lab compresses the ideation cycle down to seconds. ⚡️
      </p>
    </>
  ),
  objectmaker: (
    <>
      <p>
        🧠 Object Maker is a workspace for structured creativity. Start with a conversational brief and the assistant drafts JSON
        schemas that describe imaginative artifacts—anything from a pizza, to a track-ready car, to a curated ice cream
        flight. Once the schema looks right, you can call the
        <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> endpoint to spin up
        dozens of variants that adhere to the structure. The workflow is grounded in Groq hosted
        <span className="font-medium"> openai/gpt-oss-20b</span> and <span className="font-medium">openai/gpt-oss-120b</span>
        models, keeping generation fast while your schema evolves. ⚙️
      </p>
      <p>
        Each session curates a “Zoo” of finished creations so you can revisit, iterate, and compare outputs. The aim is to
        demonstrate how reliable JSON scaffolding unlocks downstream tooling: the sharper the schema, the more dependable the
        generated objects. Image generation integrations are planned, but today is about perfecting the structured prompt. 🗂️
      </p>
    </>
  ),
  stlviewer: (
    <>
      <p>
        🧩 STL Studio preserves the original 3D printing workflow. The assistant can draft STL snippets, explain mesh edits, and,
        thanks to the embedded viewer, render models directly inside the chat transcript. Share a design tweak, paste an STL
        file, and see the preview update without leaving the conversation. 🖥️
      </p>
      <p>
        It is ideal for rapid iteration on printable parts, offering slicing tips, material suggestions, and context-aware
        troubleshooting. Whether you are validating overhangs or collaborating on a new gadget, the mix of text guidance and
        inline visuals keeps the feedback loop tight. 🔁
      </p>
    </>
  ),
  pokedex: (
    <>
      <p>
        📘 The Pokédex workspace is a focused encyclopedia for trainers. Ask about any Pokémon and you will get typings,
        strengths, weaknesses, and a bite-sized lore blurb sourced from our remote service. It is tuned to stay in-universe:
        off-topic questions politely steer you back to the Pokédex. 🎓
      </p>
      <p>
        Combine it with team-building sessions or quick reminders before a battle. Because the base URL is configurable, you
        can point the workspace at experimental datasets or community-maintained entries while keeping the same interface. 🔄
      </p>
    </>
  ),
  svglab: (
    <>
      <p>
        🎨 SVG Prompt Lab turns the paint-by-text demo into a polished studio. Type instructions (“draw a rocket in a frame,
        make the stars sparkle”) and the UI relays them to the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/svg</code>
        worker route. The JSON response includes the raw markup and a ready-to-use data URL so you can preview the artwork in
        seconds.
      </p>
      <p>
        Every generation automatically lands in a cookie-backed gallery. Tap a tile to reload its markup, copy the SVG source,
        and remix the prompt. It is a fast way to prototype iconography or onboarding illustrations while the LLM does the
        coordinate math for you. ✍️
      </p>
    </>
  ),
  flagfoundry: (
    <>
      <p>
        🚩 Flag Foundry adapts the SVG Prompt Lab flow for vexillology fans. It now covers every sovereign flag, grouped by continent. Europe auto-queues while the rest wait for your click so you can pace the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/svg</code> route one second at a time.
      </p>
      <p>
        Each card pairs the AI generated SVG with a Unicode-rendered reference flag using <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">react-country-flag</code>, making it easy to compare palettes and ratios while the gallery fills in real time—whether you trigger a single region or the entire planet. 🌍
      </p>
    </>
  ),
  pizzamaker: (
    <>
      <p>
        🍕 Pizza Maker feels like running your own test kitchen. Choose sauces, cheeses, toppings, and surface treatments while the assistant suggests inventive combinations—truffle honey on a blistered crust, charred broccolini with smoked mozzarella, or a Detroit-style corner slice with an HDR drizzle. Every configuration becomes a lush prompt that Groq sends to the Flux image backend for plating. 🔥
      </p>
      <p>
        As soon as the render lands, you can tweak the brief and spin up variants to compare crust textures, camera angles, or prop styling. Save favorites, export the art direction notes, and share a mood board with your team. It is ideal for restaurants, food stylists, or anyone craving a hyper-real hero shot. 📸
      </p>
    </>
  ),
  carmaker: (
    <>
      <p>
        🚗 Car Maker doubles as a concept studio for automotive storytellers. Start by selecting a marque, paint finish, and performance stance, then layer in cinematic lighting cues like dusk reflections or rain-slick asphalt. The assistant keeps recommendations grounded in automotive vocabulary—splitters, wheel fitment, aero kits—so each prompt reads like a creative brief a photographer would love. 🌆
      </p>
      <p>
        Once generated, swap environments, colorways, or camera focal lengths to craft an entire campaign from a single session. The gallery remembers your best looks and surfaces the prompt metadata for future shoots. Great for designers pitching concept decks, agencies iterating mood boards, or fans dreaming up their next build. 🏁
      </p>
    </>
  ),
  sixdegrees: (
    <>
      <p>
        🎭 Six Degrees Of is a parody escalator. Drop in any sentence and we will send it through six rapid-fire parodies,
        each one riffing only on what came immediately before it. The responses show up one-by-one so you can watch the
        humor mutate in real time. ⏱️
      </p>
      <p>
        Under the hood it taps the same Groq-accelerated chat endpoint, but with a playful system prompt that keeps each
        remix short, witty, and distinct from the original. Use it for creative warm-ups, writing prompts, or just a quick
        laugh between tasks. 😄
      </p>
    </>
  ),
  newsanalyzer: (
    <>
      <p>
        🗞️ News Analyzer connects to a Cloudflare Worker that aggregates live articles, quotes, and metadata from across the web. Start by filtering the beats you care about—markets, climate, geopolitics—and the assistant contextualizes the incoming headlines with timelines, related coverage, and source links. It is a rapid way to separate the signal from the noise. 📊
      </p>
      <p>
        Ask for comparisons, bullet summaries, or follow-up questions and the assistant grounds responses in the fetched documents, noting when context is thin or evolving. Pin the conversations you want to revisit and export briefings for stakeholders. Analysts, comms teams, and curious readers all get a high-velocity newsroom companion. 📰
      </p>
    </>
  ),
}

const tagsById = {
  allergyfinder: ['chat-based', 'data-connected', 'safety-first'],
  imagegen: ['image-based', 'flux-powered', 'gallery-backed'],
  objectmaker: ['chat-based', 'schema-first', 'automation-ready'],
  stlviewer: ['chat-based', '3d-workflow', 'viewer-embedded'],
  pokedex: ['chat-based', 'fandom', 'api-powered'],
  svglab: ['text-to-svg', 'gallery-backed', 'promptable'],
  flagfoundry: ['image-based', 'svg-automation', 'slow-drip'],
  pizzamaker: ['image-based', 'guided-prompts', 'culinary'],
  carmaker: ['image-based', 'cinematic', 'automotive'],
  newsanalyzer: ['chat-based', 'data-connected', 'real-time'],
  sixdegrees: ['chat-based', 'humor', 'sequential'],
}

const experienceLookup = Object.fromEntries(experiences.map((experience) => [experience.id, experience]))

const baseExperienceCategories = [
  {
    id: 'specialists',
    title: 'Specialist Assistants',
    description: 'Domain experts that deliver answers with context, transparency, and speed.',
    experienceIds: ['allergyfinder', 'newsanalyzer'],
  },
  {
    id: 'builders',
    title: 'Schema & 3D Labs',
    description: 'Structured creativity hubs for JSON schematics and printable meshes.',
    experienceIds: ['objectmaker', 'stlviewer'],
  },
  {
    id: 'svg',
    title: 'SVG Studios',
    description: 'Vector-first workspaces for programmatic art and evolving flags.',
    experienceIds: ['svglab', 'flagfoundry'],
  },
  {
    id: 'visuals',
    title: 'Visual Launchpads',
    description: 'Image-first workflows that stage cinematic scenes and product-ready art.',
    experienceIds: ['imagegen', 'pizzamaker', 'carmaker'],
  },
  {
    id: 'play',
    title: 'Play & Discovery',
    description: 'Lighthearted sandboxes for fandoms, remixing, and storytelling breaks.',
    experienceIds: ['pokedex', 'sixdegrees'],
  },
]

const categorizedExperienceIds = new Set(
  baseExperienceCategories.flatMap((category) => category.experienceIds)
)

const uncategorizedExperienceIds = experiences
  .map((experience) => experience.id)
  .filter((experienceId) => !categorizedExperienceIds.has(experienceId))

const experienceCategories = uncategorizedExperienceIds.length
  ? [
      ...baseExperienceCategories,
      {
        id: 'fresh',
        title: 'Fresh Drops',
        description: 'New experiments and utilities that just landed in the studio.',
        experienceIds: uncategorizedExperienceIds,
      },
    ]
  : baseExperienceCategories

export default function HomePage() {

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 px-8 py-12 text-white shadow-xl">
        <div className="max-w-5xl space-y-6">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">Groq Studio</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">All experiences in one workspace.</h1>
            <p className="text-base text-white/90">
              Launch the assistants that fit your workflow—whether you are prototyping JSON schemas, staging cinematic imagery,
              or diving into trusted domain research. ⚡️
            </p>
          </div>
          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            {experienceCategories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 shadow-sm backdrop-blur transition hover:border-white/20 hover:bg-white/15"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-white/0 to-white/10 opacity-0 transition group-hover:opacity-100" aria-hidden />
                <div className="relative space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{category.title}</h2>
                    <p className="text-sm text-white/80">{category.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {category.experienceIds
                      .map((experienceId) => experienceLookup[experienceId])
                      .filter(Boolean)
                      .map((experience) => (
                        <Link
                          key={experience.id}
                          to={experience.path}
                          className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
                        >
                          <span>{experience.name}</span>
                          <span aria-hidden>↗</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </section>

      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-emerald-500 via-cyan-500 to-sky-500 px-6 py-8 text-white shadow-xl sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]" aria-hidden />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-white/80">Spotlight · New utility</p>
            <h2 className="text-2xl font-semibold sm:text-3xl">BHP — Bank Holiday Planner</h2>
            <p className="text-sm leading-relaxed text-white/80">
              Optimize your paid leave around official bank holidays for the USA, UK, France, Spain, and Italy. BHP prepares a
              strict
              <code className="mx-1 rounded bg-white/20 px-1 py-0.5 text-[0.7rem] font-semibold text-white">/obj</code>
              schema request so the assistant can return PTO blocks, totals, and a comparison against randomly scattered leave
              days.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/bank-holiday-planner"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow transition hover:bg-emerald-50"
              >
                Launch planner
                <span aria-hidden>→</span>
              </Link>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/80">
                Calendar heatmap included
              </span>
            </div>
          </div>
          <div className="relative hidden justify-center lg:flex">
            <div className="relative w-full max-w-xs rounded-3xl border border-white/25 bg-white/10 p-6 text-left shadow-lg">
              <div className="absolute -top-10 right-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">Sample itinerary</p>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-white/10 p-3 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">Stretch</p>
                  <p className="text-lg font-semibold text-white">Apr 27 → May 12</p>
                  <p className="text-xs text-white/70">Wrap two long weekends into a 16 day break.</p>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-white">
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">PTO Used</dt>
                    <dd className="text-xl font-semibold">6 days</dd>
                  </div>
                  <div>
                    <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Coverage</dt>
                    <dd className="text-xl font-semibold">16 days</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">Next best option</dt>
                    <dd className="text-sm text-white/75">
                      4 PTO days · 11 days off total — BHP highlights why the top plan wins.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <header className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Deep dive into each workspace ✨</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Every experience shares the core Groq Studio shell, but the long-form briefs below highlight their data sources,
            inline tools, and standout workflows so you can choose the right copilot for the moment. 🎯
          </p>
        </header>
        <div className="space-y-8">
          {experiences.map((experience) => {
            const detailedCopy = detailedCopyById[experience.id] ?? <p>{experience.description}</p>
            const tags = tagsById[experience.id] ?? []

            return (
              <article
                key={experience.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
                  <div className="absolute -bottom-24 left-6 h-36 w-36 rounded-full bg-slate-400/10 blur-3xl" />
                </div>
                <div className="relative space-y-5">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${experience.heroGradient}`} aria-hidden />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${experience.panelAccent}`}
                    >
                      {experience.badge}
                    </span>
                    <Link
                      to={experience.path}
                      className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                    >
                      Enter workspace
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{experience.headline}</p>
                  <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detailedCopy}</div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {experience.modelOptions.join(' • ')}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
