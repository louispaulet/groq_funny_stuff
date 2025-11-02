import clsx from 'clsx'

function OptionButton({ option, modelAnswers, correctAnswer, activeModel, models }) {
  const letter = option.label
  const text = option.text
  const isCorrect = correctAnswer === letter
  const pickedByA = modelAnswers?.modelA === letter
  const pickedByB = modelAnswers?.modelB === letter
  const activeModelId = activeModel?.id
  const activeModelWaiting = activeModelId ? modelAnswers?.[activeModelId] == null : false

  const baseClasses =
    'relative w-full overflow-hidden rounded-2xl border border-slate-300 bg-white px-5 py-4 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-default dark:border-slate-700/70 dark:bg-slate-900/80 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900'

  const stateClasses = clsx({
    'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_18px_45px_-20px_rgba(16,185,129,0.65)] dark:border-emerald-400/80 dark:bg-emerald-500/20 dark:text-emerald-100': isCorrect,
    'border-sky-300 bg-sky-50 text-sky-800 shadow-[0_18px_45px_-24px_rgba(56,189,248,0.65)] dark:border-sky-400/80 dark:bg-sky-500/20 dark:text-sky-100': pickedByA && !isCorrect,
    'border-rose-300 bg-rose-50 text-rose-800 shadow-[0_18px_45px_-24px_rgba(244,114,182,0.55)] dark:border-rose-400/80 dark:bg-rose-500/20 dark:text-rose-100': pickedByB && !isCorrect,
    'text-slate-900 dark:text-slate-100': !pickedByA && !pickedByB && !isCorrect,
  })

  const glowLayers = []
  if (pickedByA)
    glowLayers.push(
      <span
        key="a"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-sky-400/15 blur-lg dark:bg-sky-500/20"
        aria-hidden="true"
      />,
    )
  if (pickedByB)
    glowLayers.push(
      <span
        key="b"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-rose-400/15 blur-lg dark:bg-rose-500/25"
        aria-hidden="true"
      />,
    )
  if (activeModelWaiting)
    glowLayers.push(
      <span
        key="active"
        className="pointer-events-none absolute inset-0 animate-pulse rounded-2xl bg-indigo-400/10 dark:bg-indigo-500/25"
        aria-hidden="true"
      />,
    )

  return (
    <button type="button" className={clsx(baseClasses, stateClasses, 'min-h-[92px]')} disabled>
      <span className="relative z-10 flex items-start gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-lg font-extrabold text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          {letter}
        </span>
        <span className="flex-1 text-base font-semibold leading-snug">{text}</span>
      </span>
      {glowLayers}
      {isCorrect ? (
        <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/70 bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-800 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-100">
          Correct
        </span>
      ) : null}
      {pickedByA && !pickedByB ? (
        <span
          className="pointer-events-none absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-sky-300/70 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-700 shadow-sm dark:border-sky-400/60 dark:bg-sky-500/20 dark:text-sky-100"
          title={models?.modelA?.display || models?.modelA?.id || models?.modelA?.shortName || 'Model A'}
        >
          {models?.modelA?.badgeLabel || models?.modelA?.shortName || 'Model A'}
        </span>
      ) : null}
      {pickedByB && !pickedByA ? (
        <span
          className="pointer-events-none absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-rose-300/70 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-700 shadow-sm dark:border-rose-400/60 dark:bg-rose-500/20 dark:text-rose-100"
          title={models?.modelB?.display || models?.modelB?.id || models?.modelB?.shortName || 'Model B'}
        >
          {models?.modelB?.badgeLabel || models?.modelB?.shortName || 'Model B'}
        </span>
      ) : null}
      {pickedByA && pickedByB ? (
        <span className="pointer-events-none absolute left-4 bottom-4 inline-flex items-center gap-2 rounded-full border border-purple-300/80 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-purple-700 shadow-sm dark:border-purple-400/60 dark:bg-purple-500/25 dark:text-purple-100">
          Duel Lock
        </span>
      ) : null}
    </button>
  )
}

export function QAArenaQuestionCard({ question, questionIndex, totalQuestions, modelAnswers, correctAnswer, activeModel, models }) {
  if (!question) {
    return (
      <section className="flex min-h-[420px] flex-col justify-center rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-center text-sm font-semibold text-slate-500 shadow-md shadow-slate-900/10 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
        Awaiting the next challenge…
      </section>
    )
  }

  const title = `Question ${questionIndex + 1} of ${totalQuestions}`

  return (
    <section className="relative flex min-h-[420px] flex-col gap-6 overflow-hidden rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-slate-900 shadow-md shadow-slate-900/10 transition dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100">
      <div className="pointer-events-none absolute -top-32 right-16 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-500/20" aria-hidden="true" />
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">{title}</p>
        <h2 className="text-2xl font-black leading-snug text-slate-900 dark:text-white">{question.prompt}</h2>
      </header>
      <div className="flex flex-col gap-3">
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
