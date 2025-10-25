export default function CarMakerPrompt({ prompt, imageUrl }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
      <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Prompt & render</h3>
      </header>
      <div className="space-y-4 p-5">
        {prompt ? (
          <article className="space-y-3">
            <div className="rounded-lg border border-slate-200 bg-white/90 p-3 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
              {prompt}
            </div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Generated hero car"
                className="w-full rounded-xl border border-slate-200 bg-slate-100 object-cover shadow-sm dark:border-slate-700 dark:bg-slate-900"
              />
            ) : null}
          </article>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/40 p-6 text-center text-sm text-slate-400 dark:border-slate-700 dark:bg-slate-900/20 dark:text-slate-500">
            Configure the ride and generate to see your prompt and render here.
          </div>
        )}
      </div>
    </section>
  )
}
