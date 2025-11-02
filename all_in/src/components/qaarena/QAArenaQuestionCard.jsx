import clsx from 'clsx'

function OptionButton({ option, modelAnswers, correctAnswer, activeModel, models }) {
  const letter = option.label
  const text = option.text
  const isCorrect = correctAnswer === letter
  const pickedByA = modelAnswers?.modelA === letter
  const pickedByB = modelAnswers?.modelB === letter
  const activeModelId = activeModel?.id
  const activeModelWaiting = activeModelId ? modelAnswers?.[activeModelId] == null : false

  const baseClasses = 'relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'

  const stateClasses = clsx({
    'border-emerald-400/80 bg-emerald-500/20 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.45)]': isCorrect,
    'border-sky-400/70 bg-sky-500/10 text-sky-100': pickedByA && !isCorrect,
    'border-rose-400/70 bg-rose-500/10 text-rose-100': pickedByB && !isCorrect,
    'border-indigo-500/40 bg-slate-900/40 text-slate-100': !pickedByA && !pickedByB && !isCorrect,
  })

  const glowLayers = []
  if (pickedByA)
    glowLayers.push(
      <span
        key="a"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-sky-500/20 blur-md"
        aria-hidden="true"
      />,
    )
  if (pickedByB)
    glowLayers.push(
      <span
        key="b"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-rose-500/20 blur-md"
        aria-hidden="true"
      />,
    )
  if (activeModelWaiting)
    glowLayers.push(
      <span
        key="active"
        className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl bg-indigo-500/15"
        aria-hidden="true"
      />,
    )

  return (
    <button type="button" className={clsx(baseClasses, stateClasses)} disabled>
      <span className="relative z-10 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-900/80 text-lg font-extrabold text-white">
          {letter}
        </span>
        <span className="flex-1 text-base font-medium leading-snug text-slate-100">{text}</span>
      </span>
      {glowLayers}
      {isCorrect ? (
        <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/80 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-100">
          Correct
        </span>
      ) : null}
      {pickedByA && !pickedByB ? (
        <span
          className="pointer-events-none absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-sky-100"
          title={models?.modelA?.display || models?.modelA?.id || models?.modelA?.shortName || 'Model A'}
        >
          {models?.modelA?.badgeLabel || models?.modelA?.shortName || 'Model A'}
        </span>
      ) : null}
      {pickedByB && !pickedByA ? (
        <span
          className="pointer-events-none absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-rose-100"
          title={models?.modelB?.display || models?.modelB?.id || models?.modelB?.shortName || 'Model B'}
        >
          {models?.modelB?.badgeLabel || models?.modelB?.shortName || 'Model B'}
        </span>
      ) : null}
      {pickedByA && pickedByB ? (
        <span className="pointer-events-none absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/30 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-purple-100">
          Duel Lock
        </span>
      ) : null}
    </button>
  )
}

export function QAArenaQuestionCard({ question, questionIndex, totalQuestions, modelAnswers, correctAnswer, activeModel, models }) {
  if (!question) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-3xl border border-dashed border-slate-600/60 bg-slate-900/30 text-slate-400">
        Awaiting the next challenge…
      </div>
    )
  }

  const title = `Question ${questionIndex + 1} of ${totalQuestions}`

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800 p-6 text-white shadow-xl shadow-slate-900/40">
      <div className="absolute -top-20 -right-24 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />
      <header className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">{title}</p>
        <h2 className="text-3xl font-black leading-tight text-white">{question.prompt}</h2>
      </header>
      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <OptionButton
            key={option.label}
            option={option}
            modelAnswers={modelAnswers}
            correctAnswer={correctAnswer}
            activeModel={activeModel}
            models={models}
          />
        ))}
      </div>
    </section>
  )
}
