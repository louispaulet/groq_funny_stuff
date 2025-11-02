import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

const MODEL_TOKEN_THEME = {
  modelA: {
    label: 'A',
    base: 'bg-sky-500 text-white shadow-[0_0_18px_rgba(56,189,248,0.35)]',
    pendingRing: 'ring-sky-200/80 dark:ring-sky-500/60',
    pie: 'rgba(56,189,248,0.75)',
  },
  modelB: {
    label: 'B',
    base: 'bg-rose-500 text-white shadow-[0_0_18px_rgba(244,114,182,0.35)]',
    pendingRing: 'ring-rose-200/90 dark:ring-rose-500/70',
    pie: 'rgba(244,114,182,0.75)',
  },
  default: {
    label: '?',
    base: 'bg-slate-500 text-white shadow-[0_0_18px_rgba(148,163,184,0.35)]',
    pendingRing: 'ring-slate-200/80 dark:ring-slate-500/60',
    pie: 'rgba(148,163,184,0.7)',
  },
}

function ModelToken({ modelKey, state, shortName, title, pendingCountdown }) {
  const theme = MODEL_TOKEN_THEME[modelKey] || MODEL_TOKEN_THEME.default
  const baseClasses = 'relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-xs font-black uppercase tracking-[0.2em] transition'
  const stateClasses = clsx('ring-2 ring-white/20 dark:ring-white/10', theme.base, {
    'ring-emerald-400 shadow-[0_0_22px_rgba(16,185,129,0.38)]': state === 'correct',
    'ring-rose-400 shadow-[0_0_22px_rgba(244,114,182,0.38)]': state === 'incorrect',
    [theme.pendingRing]: state === 'pending',
  })
  const hasCountdown =
    state === 'pending' &&
    pendingCountdown &&
    Number.isFinite(pendingCountdown.current) &&
    Number.isFinite(pendingCountdown.max) &&
    pendingCountdown.max > 0
  const remaining = hasCountdown ? Math.max(pendingCountdown.current, 0) : 0
  const usedFraction = hasCountdown ? Math.min(Math.max(1 - remaining / pendingCountdown.max, 0), 1) : 0
  const RADIUS = 24
  const TRACK_WIDTH = 6
  const circumference = 2 * Math.PI * RADIUS

  return (
    <span className={clsx(baseClasses, stateClasses)} title={title} aria-label={`${shortName} token: ${state}`}>
      {hasCountdown ? (
        <svg className="pointer-events-none absolute -inset-[10px] h-[56px] w-[56px]" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r={RADIUS} className="fill-none opacity-20" stroke="rgba(255,255,255,0.35)" strokeWidth={TRACK_WIDTH} />
          <circle
            cx="32"
            cy="32"
            r={RADIUS}
            className="fill-none transition-[stroke-dashoffset]"
            stroke={theme.pie}
            strokeWidth={TRACK_WIDTH}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={usedFraction * circumference}
            transform="rotate(-90 32 32)"
          />
        </svg>
      ) : null}
      <span className="relative z-10">{theme.label}</span>
      {hasCountdown ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-[0.25em] text-white drop-shadow-sm">
          {Math.ceil(remaining)}
        </span>
      ) : null}
    </span>
  )
}

function OptionCard({ option, tokens, isCorrect }) {
  const hasPendingToken = tokens.some((token) => token.state === 'pending')
  const hasSettledToken = tokens.some((token) => token.state === 'correct' || token.state === 'incorrect')

  const cardClasses = clsx(
    'relative overflow-hidden rounded-2xl border px-5 py-4 transition duration-300 ease-out',
    'bg-white/95 text-slate-900 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100',
    isCorrect
      ? 'border-emerald-400/80 bg-emerald-50/80 shadow-[0_24px_45px_-28px_rgba(16,185,129,0.65)] dark:border-emerald-400/80 dark:bg-emerald-500/15'
      : 'border-slate-200/80 dark:border-slate-700/60',
    hasPendingToken &&
      'ring-2 ring-sky-300/70 shadow-lg shadow-sky-200/40 dark:ring-sky-500/60 dark:shadow-sky-500/25',
    hasSettledToken && !isCorrect && 'border-slate-300 shadow-md dark:border-slate-600/70',
  )

  return (
    <div className={cardClasses}>
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-lg font-black text-slate-900 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          {option.label}
        </span>
        <div className="flex-1 space-y-3">
          <p className="text-base font-semibold leading-relaxed">{option.text}</p>
          {isCorrect ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/80 bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-700 shadow-sm dark:border-emerald-400/60 dark:bg-emerald-500/20 dark:text-emerald-100">
              Correct Answer
            </span>
          ) : null}
        </div>
        <div className="flex min-h-[32px] shrink-0 items-start gap-2">
          {tokens.map((token) => (
            <ModelToken key={token.modelKey} {...token} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ShuffleOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      <div className="absolute -top-6 left-8 h-24 w-16 -rotate-6 rounded-2xl border border-slate-200/70 bg-white/80 shadow-lg shadow-slate-900/10 backdrop-blur-sm animate-bounce dark:border-slate-700/60 dark:bg-slate-800/70" style={{ animationDuration: '1.3s' }} />
      <div className="absolute -bottom-10 right-10 h-28 w-[4.5rem] rotate-6 rounded-2xl border border-slate-200/70 bg-slate-100/80 shadow-lg shadow-slate-900/10 backdrop-blur-sm animate-bounce dark:border-slate-700/60 dark:bg-slate-700/70" style={{ animationDelay: '0.15s', animationDuration: '1.4s' }} />
      <div className="absolute top-1/2 left-1/2 h-24 w-20 -translate-x-1/2 -translate-y-1/2 rotate-3 rounded-3xl border border-indigo-200/70 bg-gradient-to-br from-sky-400/40 via-indigo-400/30 to-purple-400/30 shadow-xl shadow-indigo-500/40 animate-ping dark:border-indigo-500/40" style={{ animationDuration: '1.1s' }} />
    </div>
  )
}

export function QAArenaQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  modelAnswers,
  correctAnswer,
  activeModel,
  models,
  isShuffling,
  countdown,
  countdownMax,
}) {
  const [hoverTargets, setHoverTargets] = useState({ modelA: null, modelB: null })
  const [showShuffleOverlay, setShowShuffleOverlay] = useState(false)
  const hoverTimerRef = useRef(null)
  const shuffleTimerRef = useRef(null)

  useEffect(() => {
    setHoverTargets({ modelA: null, modelB: null })
  }, [question?.id])

  useEffect(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
    const activeId = activeModel?.id
    if (!activeId || !question?.options?.length || modelAnswers?.[activeId]) {
      if (activeId) {
        setHoverTargets((prev) => (prev[activeId] ? { ...prev, [activeId]: null } : prev))
      }
      return () => {}
    }

    const moveToken = () => {
      if (!question?.options?.length) return
      const randomIndex = Math.floor(Math.random() * question.options.length)
      const nextLabel = question.options[randomIndex]?.label ?? null
      setHoverTargets((prev) => ({ ...prev, [activeId]: nextLabel }))
      hoverTimerRef.current = setTimeout(moveToken, 420 + Math.random() * 420)
    }

    moveToken()
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
      }
    }
  }, [activeModel, modelAnswers, question?.options])

  useEffect(() => {
    if (!isShuffling) return
    setShowShuffleOverlay(true)
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current)
    }
    shuffleTimerRef.current = setTimeout(() => {
      setShowShuffleOverlay(false)
      shuffleTimerRef.current = null
    }, 750)
  }, [isShuffling])

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current)
    }
  }, [])

  const options = question?.options || []
  const tokensByOption = useMemo(() => {
    const map = Object.fromEntries(options.map((opt) => [opt.label, []]))
    const modelKeys = ['modelA', 'modelB']

    modelKeys.forEach((modelKey) => {
      const info = models?.[modelKey] || {}
      const finalAnswer = modelAnswers?.[modelKey]
      const hoverLabel = hoverTargets[modelKey]
      const shortName = info.badgeLabel || info.shortName || info.id || modelKey.toUpperCase()
      const displayTitle = info.display || info.id || shortName

      if (finalAnswer && map[finalAnswer]) {
        map[finalAnswer].push({
          modelKey,
          state: finalAnswer === correctAnswer ? 'correct' : 'incorrect',
          shortName,
          title: `${displayTitle} chose option ${finalAnswer}`,
          pendingCountdown: null,
        })
        return
      }

      if (activeModel?.id === modelKey && hoverLabel && map[hoverLabel]) {
        map[hoverLabel].push({
          modelKey,
          state: 'pending',
          shortName,
          title: `${displayTitle} is hovering option ${hoverLabel}`,
          pendingCountdown: countdown
            ? {
                current: Number.isFinite(countdown.seconds) ? countdown.seconds : null,
                max: Number.isFinite(countdownMax) && countdownMax > 0 ? countdownMax : Number.isFinite(countdown.seconds) ? Math.ceil(countdown.seconds) : null,
              }
            : null,
        })
      }
    })

    return map
  }, [activeModel, correctAnswer, countdown?.seconds, countdownMax, hoverTargets, modelAnswers, models, options])

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
      {showShuffleOverlay ? <ShuffleOverlay /> : null}
      <header className="relative space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">{title}</p>
        <h2 className="text-2xl font-black leading-snug text-slate-900 dark:text-white">{question.prompt}</h2>
      </header>
      <div className="relative flex flex-col gap-3">
        {options.map((option) => (
          <OptionCard key={option.label} option={option} tokens={tokensByOption[option.label] || []} isCorrect={correctAnswer === option.label} />
        ))}
      </div>
    </section>
  )
}
