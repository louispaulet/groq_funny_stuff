import { Link } from 'react-router-dom'
import { experiences } from '../config/experiences'

export default function HomePage() {
  const objectMaker = experiences.find((experience) => experience.id === 'objectmaker')
  const secondaryExperiences = experiences.filter((experience) => experience.id !== 'objectmaker')

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

      {objectMaker && (
        <section className="overflow-hidden rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-100 via-white to-yellow-100 p-10 shadow-lg dark:border-amber-500/30 dark:from-amber-400/20 dark:via-slate-900 dark:to-yellow-500/10">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-4">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${objectMaker.panelAccent}`}>
                {objectMaker.badge}
              </span>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Object Maker</h2>
              <p className="text-base text-slate-700 dark:text-slate-300">
                Object Maker is our playground for structured creativity. Start with a conversational brief and the assistant drafts
                JSON schemas that describe imaginative artifacts—anything from a pizza, to a track-ready car, to a whimsical ice
                cream flight. Once the schema looks right, you can call the <code className="rounded bg-slate-900/80 px-1 py-0.5 text-xs text-white">/obj</code>
                endpoint to spin up dozens of variants that adhere to the structure. The workflow is grounded in Groq hosted
                <span className="font-medium"> openai/gpt-oss-20b</span> and <span className="font-medium">openai/gpt-oss-120b</span> models, keeping generation fast while your schema evolves.
              </p>
              <p className="text-base text-slate-700 dark:text-slate-300">
                Every session also curates a “Zoo” of finished creations so you can revisit, remix, and compare outputs. The goal is to
                explore how reliable JSON scaffolding unlocks downstream tooling: the tighter the schema, the more adventurous the
                generated objects. Image generation hooks are on the roadmap, but today is all about perfecting the structured prompt.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to={objectMaker.path}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-amber-400"
                >
                  Launch Object Maker
                  <span aria-hidden>→</span>
                </Link>
                <span className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">{objectMaker.modelOptions.join(' • ')}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="space-y-10">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Explore the other workspaces</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Each experience shares the same chat shell yet brings its own data sources, inline tools, and best practices. Dive in to
            see how focused assistants feel when they are tuned for a specific workflow.
          </p>
        </header>
        <div className="space-y-8">
          {secondaryExperiences.map((experience) => {
            let detailedCopy

            switch (experience.id) {
              case 'allergyfinder':
                detailedCopy = (
                  <>
                    <p>
                      AllergyFinder taps into Open Food Facts so it can examine ingredient panels in context. Bring your saved allergen
                      profile into the conversation and the assistant highlights risky ingredients, suggests safe alternatives, and drafts
                      grocery lists that respect your preferences. Transparency comes first: responses call out when product data is
                      missing or when you should double-check real-world packaging.
                    </p>
                    <p>
                      Use it for meal planning, quick label triage, or inspiration when you are cooking for friends with different dietary
                      needs. Because it runs on Groq-accelerated LLMs, you get near-instant summaries even for lengthy ingredient lists.
                    </p>
                  </>
                )
                break
              case 'stlviewer':
                detailedCopy = (
                  <>
                    <p>
                      STL Studio keeps the original 3D printing experiment alive. The assistant can draft STL snippets, explain mesh edits,
                      and, thanks to the embedded viewer, render models directly inside the chat transcript. Share a design tweak, paste an
                      STL file, and see the preview update without leaving the conversation.
                    </p>
                    <p>
                      It is ideal for rapid iteration on printable parts, offering slicing tips, material suggestions, and context-aware
                      troubleshooting. Whether you are validating overhangs or collaborating on a new gadget, the mix of text guidance and
                      inline visuals keeps the feedback loop tight.
                    </p>
                  </>
                )
                break
              case 'pokedex':
                detailedCopy = (
                  <>
                    <p>
                      The Pokédex workspace is a focused encyclopedia for trainers. Ask about any Pokémon and you will get typings,
                      strengths, weaknesses, and a bite-sized lore blurb sourced from our remote service. It is tuned to stay in-universe:
                      off-topic questions politely steer you back to the Pokédex.
                    </p>
                    <p>
                      Combine it with team-building sessions or quick reminders before a battle. Because the base URL is configurable, you
                      can point the workspace at experimental datasets or community-maintained entries while keeping the same interface.
                    </p>
                  </>
                )
                break
              default:
                detailedCopy = <p>{experience.description}</p>
            }

            return (
              <article
                key={experience.id}
                className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${experience.panelAccent}`}>
                    {experience.badge}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{experience.name}</h3>
                  <Link
                    to={experience.path}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-200"
                  >
                    Enter workspace
                    <span aria-hidden>→</span>
                  </Link>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{experience.headline}</p>
                <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">{detailedCopy}</div>
                <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">{experience.modelOptions.join(' • ')}</div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
