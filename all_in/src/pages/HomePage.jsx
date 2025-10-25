import { Link } from 'react-router-dom'
import GameOfLifeShowcase from '../components/home/GameOfLifeShowcase'
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
  mermaidstudio: (
    <>
      <p>
        🧭 Mermaid Display is a diagramming console for rapid flowcharting. Drop in Mermaid syntax, tap render, and watch the
        canvas refresh instantly—perfect for sequencing pipelines, swim lanes, or onboarding walkthroughs without leaving the
        browser.
      </p>
      <p>
        Every time you iterate on the prompt, the previous diagram slides into a cookie-backed gallery with a live SVG preview.
        Build a playlist of saved flows, reload them with one click, and keep experimenting with zero setup. 🗂️
      </p>
    </>
  ),
  flagfoundry: (
    <>
      <p>
        🚩 Flag Foundry adapts the SVG Prompt Lab flow for vexillology fans. It now covers every sovereign flag, grouped by continent. Europe auto-queues while the rest wait for your click so you can pace the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/svg</code> route two seconds at a time.
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
  pongshowdown: (
    <>
      <p>
        🕹️ Pong Showdown is an autonomous rally where Groq-hosted LLAMA 4 models restyle the court in real time. Every paddle deflection or out-of-bounds point calls the
        <code className="rounded bg-slate-900/80 px-1 py-0.5 text-[0.7rem] text-white">/obj</code> endpoint with a schema demanding labeled colors and usage prompts. The response
        paints the background, paddles, ball, and scoreboard with fresh hex values the instant the rally continues.
      </p>
      <p>
        Use it as a living demo of structured outputs driving UI state. The paddles run on simple AI while the Groq workers keep the palette energetic and legible—perfect for showcasing
        how deterministic schemas and low-latency inference can remix an experience mid-game. 🎨
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
  mermaidstudio: ['diagramming', 'mermaid', 'cookie-gallery'],
  flagfoundry: ['image-based', 'svg-automation', 'slow-drip'],
  pizzamaker: ['image-based', 'guided-prompts', 'culinary'],
  carmaker: ['image-based', 'cinematic', 'automotive'],
  newsanalyzer: ['chat-based', 'data-connected', 'real-time'],
  sixdegrees: ['chat-based', 'humor', 'sequential'],
  pongshowdown: ['arcade', 'structured-output', 'llama-4'],
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
    id: 'diagramming',
    title: 'Diagram Studios',
    description: 'Prompt Mermaid to map flows and keep every render close by.',
    experienceIds: ['mermaidstudio'],
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
    experienceIds: ['pokedex', 'sixdegrees', 'pongshowdown'],
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

const gameOfLifeLabDetails = (
  <>
    <p>
      Conway&apos;s Game of Life is a zero-player cellular automaton where each generation springs from the last. A
      four-rule system lets gliders, pulsars, and guns emerge from simple seeds—no human steering. Brush up on the
      origin story on{' '}
      <a
        href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-sky-600 underline-offset-2 transition hover:underline dark:text-sky-300"
      >
        Wikipedia
      </a>
      .
    </p>
    <p>
      The Game of Life Lab lets you dial in the matrix size, swap curated presets, and modulate the simulation clock from
      slow motion to warp speed. Centered seeds wrap around a toroidal grid so spaceships never fall off the edge.
    </p>
    <ul className="ml-4 list-disc space-y-2 text-slate-600 dark:text-slate-300">
      <li>Pause, resume, or step one generation at a time for frame-by-frame analysis.</li>
      <li>Track active-cell stats in real time to see how density shifts across the surface.</li>
      <li>Experiment with oscillators, glider guns, and looped spaceships in one quick workspace.</li>
    </ul>
  </>
)

const gameOfLifeLabTags = ['cellular-automaton', 'toroidal-grid', 'live-controls']

export default function HomePage() {
  const heroSpotlightIds = ['imagegen', 'newsanalyzer', 'objectmaker']
  const heroSpotlights = heroSpotlightIds
    .map((experienceId) => experienceLookup[experienceId])
    .filter(Boolean)

  const deepDiveExperiences = experiences.filter((experience) => detailedCopyById[experience.id])

  const spotlightProjects = [
    {
      id: 'mermaidstudio',
      eyebrow: 'Diagramming · Fresh',
      title: 'Mermaid Display',
      copy: (
        <>
          <p>
            Compose Mermaid syntax, press render, and watch the canvas refresh in the AllIn shell. It is ideal for mapping
            customer journeys, onboarding flows, and dependency graphs without leaving the browser.
          </p>
          <p>
            Every iteration captures a thumbnail in a cookie-backed gallery so you can rewind and remix previous drafts on the
            spot.
          </p>
        </>
      ),
      ctaLabel: 'Open Mermaid Display',
      ctaTo: '/mermaid-studio',
      accent: 'from-cyan-500 via-sky-500 to-indigo-500',
      badge: 'Cookie gallery',
    },
    {
      id: 'second-hand-food-market',
      eyebrow: 'Pop-up · Satirical',
      title: 'Second-Hand Food Market',
      copy: (
        <>
          <p>
            Explore a cursed bazaar of gently-used cuisine—seven-eighths of a pizza, artisanal bath water, and other dubious
            delicacies included. It is equal parts interactive fiction and UI playground.
          </p>
          <p>
            Flip cards for tasting notes, resale value, and lore snippets, all orchestrated by Groq-accelerated models with
            zero-latency banter.
          </p>
        </>
      ),
      ctaLabel: 'Visit the market',
      ctaTo: '/second-hand-food-market',
      accent: 'from-brand-500 via-amber-500 to-rose-500',
      badge: 'Curses included',
    },
    {
      id: 'dalle-vs-flux',
      eyebrow: 'Research drop',
      title: 'Flux vs DALL·E Comparison Lab',
      copy: (
        <>
          <p>
            Review 186 matched prompts rendered by Groq-hosted Flux Schnell and OpenAI’s DALL·E 3. Every tile pairs images,
            budgets, and prompt metadata for a transparent benchmark.
          </p>
          <p>
            Use it to pick the right renderer for your campaign or to make the case for lightning-fast Flux workflows.
          </p>
        </>
      ),
      ctaLabel: 'Open comparison',
      ctaTo: '/dalle-vs-flux',
      accent: 'from-fuchsia-500 via-amber-400 to-rose-500',
      badge: 'Image benchmark',
    },
  ]

  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[2.75rem] bg-gradient-to-br from-brand-600 via-indigo-700 to-slate-900 px-8 py-14 text-white shadow-xl">
        <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-white/20 via-white/0 to-transparent" aria-hidden />
        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Groq AllIn Studio</p>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                A single launchpad for every Groq-powered experiment.
              </h1>
              <p className="max-w-xl text-base text-white/85 sm:text-lg">
                Discover assistants, labs, and playful sandboxes designed to show off ultra-low-latency inference. Pick a
                project to dive in—each workspace loads instantly inside the AllIn shell.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-600 shadow transition hover:bg-brand-50"
              >
                Explore the studio story
                <span aria-hidden>→</span>
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10"
              >
                Manage your preferences
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Now featuring</p>
            <div className="grid gap-3">
              {heroSpotlights.map((experience) => (
                <Link
                  key={experience.id}
                  to={experience.path}
                  className="group flex items-start gap-4 rounded-2xl border border-white/0 bg-white/10 px-4 py-3 transition hover:border-white/30 hover:bg-white/15"
                >
                  <span
                    className={`mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${experience.heroGradient} text-sm font-semibold text-white`}
                  >
                    {experience.name.slice(0, 2)}
                  </span>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-semibold text-white">{experience.name}</p>
                    <p className="text-xs text-white/80">{experience.headline}</p>
                  </div>
                  <span aria-hidden className="text-lg text-white/70 transition group-hover:translate-x-1 group-hover:text-white">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -right-24 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">Browse by focus</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Curated collections to jump-start your flow</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Pick a theme and hop into the assistants tuned for that mission. Every project opens inside this workspace, so you
              can swap contexts without losing your place.
            </p>
          </div>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:text-brand-200"
          >
            Learn how we choose the line-up
            <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experienceCategories.map((category) => (
            <div
              key={category.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                <div className="absolute -top-20 right-6 h-32 w-32 rounded-full bg-brand-500/10 blur-3xl" />
                <div className="absolute -bottom-24 left-8 h-32 w-32 rounded-full bg-slate-400/10 blur-3xl" />
              </div>
              <div className="relative space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500/70 dark:text-brand-300/80">{category.id}</p>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{category.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{category.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {category.experienceIds
                    .map((experienceId) => experienceLookup[experienceId])
                    .filter(Boolean)
                    .map((experience) => (
                      <Link
                        key={experience.id}
                        to={experience.path}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-500 hover:text-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-brand-500/80"
                      >
                        <span>{experience.name}</span>
                        <span aria-hidden>↗</span>
                      </Link>
                    ))}
                  {category.id === 'play' ? (
                    <Link
                      to="/game-of-life-lab"
                      className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-brand-500 hover:text-white dark:bg-white/10 dark:text-slate-200 dark:hover:bg-brand-500/80"
                    >
                      <span>Game of Life Lab</span>
                      <span aria-hidden>↗</span>
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">Experience gallery</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Every project, ready in one click</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            These workspaces run on Groq-accelerated inference. Hover to preview the vibe, then jump straight into the assistant
            that matches your next task.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map((experience) => {
            const tags = tagsById[experience.id] ?? []
            const modelOptions = experience.modelOptions ?? []

            return (
              <article
                key={experience.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                  <div className={`absolute -top-24 right-0 h-48 w-48 rounded-full bg-gradient-to-br ${experience.heroGradient} opacity-20 blur-3xl`} />
                </div>
                <div className="relative flex flex-1 flex-col space-y-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${experience.heroGradient} text-sm font-semibold text-white shadow-sm`}
                    >
                      {experience.name.slice(0, 2)}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {experience.badge}
                      </p>
                    </div>
                    <Link
                      to={experience.path}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                    >
                      Enter
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{experience.headline}</p>
                  <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{experience.description}</p>
                  {modelOptions.length > 0 ? (
                    <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {modelOptions.join(' • ')}
                    </p>
                  ) : null}
                </div>
                {tags.length > 0 ? (
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">Deep dives</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Unpack how each workspace shines</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Expand a card to learn how the assistant operates, what makes it unique, and when to bring it into your workflow.
            These notes pull from our internal playbooks so you can onboard quickly.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {deepDiveExperiences.map((experience) => {
            const detailedCopy = detailedCopyById[experience.id]

            return (
              <article
                key={experience.id}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`absolute -top-20 right-6 h-36 w-36 rounded-full bg-gradient-to-br ${experience.heroGradient} opacity-10 blur-3xl`} aria-hidden />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${experience.heroGradient} text-sm font-semibold text-white`}
                    >
                      {experience.name.slice(0, 2)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.name}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {experience.headline}
                      </p>
                    </div>
                    <Link
                      to={experience.path}
                      className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-brand-500 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-brand-400/60 dark:hover:bg-brand-500/10"
                    >
                      Enter
                      <span aria-hidden>→</span>
                    </Link>
                  </div>
                  <details className="group/deep space-y-3 rounded-2xl border border-slate-200 bg-white/80 p-4 transition open:border-brand-400 open:bg-brand-50/60 dark:border-slate-700 dark:bg-slate-900/70 dark:open:border-brand-400/60 dark:open:bg-brand-500/5">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-brand-600 outline-none transition hover:text-brand-500 dark:text-brand-300">
                      What you will explore
                    </summary>
                    <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detailedCopy}</div>
                  </details>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">Studio spotlights</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Featured drops from around the lab</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Some experiences deserve their own spotlight. These cards bundle lore, context, and quick actions so you can dive
            straight into the newest experiments.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {spotlightProjects.map((spotlight) => (
            <article
              key={spotlight.id}
              className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`absolute inset-x-0 -top-32 h-40 bg-gradient-to-br ${spotlight.accent} opacity-20 blur-3xl`} aria-hidden />
              <div className="relative flex flex-1 flex-col space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-500/70 dark:text-brand-300/80">{spotlight.eyebrow}</p>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{spotlight.title}</h3>
                </div>
                <div className="flex-1 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{spotlight.copy}</div>
                <div className="mt-2 flex items-center gap-3">
                  <Link
                    to={spotlight.ctaTo}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500"
                  >
                    {spotlight.ctaLabel}
                    <span aria-hidden>→</span>
                  </Link>
                  <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-brand-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-300">
                    {spotlight.badge}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/95 px-6 py-8 shadow-sm transition hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:px-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-600 dark:bg-white/10 dark:text-slate-300">
              Cellular playground
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Game of Life Lab</h2>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{gameOfLifeLabDetails}</div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/game-of-life-lab"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500"
              >
                Launch the simulation
                <span aria-hidden>→</span>
              </Link>
              <div className="flex flex-wrap gap-2">
                {gameOfLifeLabTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/90 p-6 shadow-inner dark:border-slate-700">
            <GameOfLifeShowcase />
          </div>
        </div>
      </section>
    </div>
  )
}
