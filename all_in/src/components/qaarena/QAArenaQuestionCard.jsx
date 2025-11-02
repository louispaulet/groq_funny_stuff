import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const SHUFFLE_ANIMATION_MS = 1100

const SHUFFLE_STYLE_ID = 'qa-arena-card-shuffle-styles'

function ensureShuffleStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(SHUFFLE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = SHUFFLE_STYLE_ID
  style.textContent = `
    @keyframes qaShuffleCard {
      0% {
        opacity: 0;
        transform: var(--qa-start-transform);
      }
      45% {
        opacity: 0.95;
        transform: var(--qa-mid-transform);
      }
      100% {
        opacity: 0;
        transform: var(--qa-end-transform);
      }
    }
    @keyframes qaTokenSlam {
      0% {
        transform: scale(0.6);
      }
      55% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1);
      }
    }
  `
  document.head.appendChild(style)
}

function ModelToken({ modelKey, state, shortName, title, pendingCountdown, slam }) {
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
    <span
      className={clsx(
        baseClasses,
        stateClasses,
        slam ? 'animate-[qaTokenSlam_0.45s_cubic-bezier(0.2,1,0.4,1)_forwards]' : '',
      )}
      title={title}
      aria-label={`${shortName} token: ${state}`}
    >
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

const OptionCard = forwardRef(function OptionCard({ option, tokens, isCorrect }, ref) {
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
    <div ref={ref} className={cardClasses} data-option-label={option.label}>
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
})

const SHUFFLE_CARD_BASE =
  'absolute left-1/2 top-1/2 h-40 w-28 -translate-x-1/2 rounded-3xl border border-white/80 bg-white/95 shadow-xl shadow-slate-900/25 dark:border-slate-600/70 dark:bg-slate-800/90'
const SHUFFLE_CARD_GRADIENTS = [
  'bg-gradient-to-br from-sky-100/80 via-white/90 to-white/60 dark:from-sky-500/30 dark:via-slate-800/60 dark:to-slate-900/40',
  'bg-gradient-to-br from-rose-100/75 via-white/90 to-white/60 dark:from-rose-500/30 dark:via-slate-800/60 dark:to-slate-900/40',
  'bg-gradient-to-br from-purple-100/75 via-white/90 to-white/60 dark:from-purple-500/30 dark:via-slate-800/60 dark:to-slate-900/40',
]

function ShuffleOverlay() {
  const cards = [
    {
      delay: 0,
      start: 'translate(-55%, -55%) scale(0.85) rotate(-22deg)',
      mid: 'translate(-48%, -78%) scale(1.05) rotate(8deg)',
      end: 'translate(-38%, -25%) scale(0.92) rotate(-5deg)',
    },
    {
      delay: 0.12,
      start: 'translate(-45%, -52%) scale(0.8) rotate(18deg)',
      mid: 'translate(-50%, -74%) scale(1.08) rotate(-6deg)',
      end: 'translate(-55%, -18%) scale(0.9) rotate(4deg)',
    },
    {
      delay: 0.24,
      start: 'translate(-50%, -48%) scale(0.82) rotate(-12deg)',
      mid: 'translate(-52%, -70%) scale(1.07) rotate(4deg)',
      end: 'translate(-47%, -12%) scale(0.9) rotate(-3deg)',
    },
  ]

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {cards.map((card, index) => (
        <div
          key={index}
          className={clsx(
            SHUFFLE_CARD_BASE,
            SHUFFLE_CARD_GRADIENTS[index % SHUFFLE_CARD_GRADIENTS.length],
            'flex flex-col items-center justify-center overflow-hidden',
          )}
          style={{
            animation: `qaShuffleCard ${SHUFFLE_ANIMATION_MS}ms ease-in-out ${card.delay}s forwards`,
            transformOrigin: 'center',
            pointerEvents: 'none',
            '--qa-start-transform': card.start,
            '--qa-mid-transform': card.mid,
            '--qa-end-transform': card.end,
          }}
        >
          <div className="absolute inset-4 rounded-2xl border border-white/60 opacity-80 dark:border-white/10" />
          <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 dark:text-slate-200">QA</span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-600 shadow-sm dark:bg-slate-900/60 dark:text-slate-200">
              Arena
            </span>
          </div>
        </div>
      ))}
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
  const optionRefs = useRef({})
  const containerRef = useRef(null)
  const [floatingTokens, setFloatingTokens] = useState({ modelA: null, modelB: null })
  const [slamLabels, setSlamLabels] = useState({})
  const slamTimeoutsRef = useRef({})
  const prevAnswersRef = useRef({ modelA: null, modelB: null })

  useEffect(() => {
    ensureShuffleStyles()
  }, [])

  useEffect(() => {
    setHoverTargets({ modelA: null, modelB: null })
    setFloatingTokens({ modelA: null, modelB: null })
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
    }, SHUFFLE_ANIMATION_MS)
  }, [isShuffling])

  useEffect(() => () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }
    if (shuffleTimerRef.current) {
      clearTimeout(shuffleTimerRef.current)
    }
    Object.values(slamTimeoutsRef.current).forEach((timeoutId) => {
      if (timeoutId) clearTimeout(timeoutId)
    })
  }, [])

  const options = question?.options || []

  const tokensByOption = useMemo(() => {
    const map = Object.fromEntries(options.map((opt) => [opt.label, []]))
    const modelKeys = ['modelA', 'modelB']

    modelKeys.forEach((modelKey) => {
      const info = models?.[modelKey] || {}
      const finalAnswer = modelAnswers?.[modelKey]
      const shortName = info.badgeLabel || info.shortName || info.id || modelKey.toUpperCase()
      const displayTitle = info.display || info.id || shortName

      if (finalAnswer && map[finalAnswer]) {
        map[finalAnswer].push({
          modelKey,
          state: finalAnswer === correctAnswer ? 'correct' : 'incorrect',
          shortName,
          title: `${displayTitle} chose option ${finalAnswer}`,
          pendingCountdown: null,
          slam: slamLabels[modelKey] === finalAnswer,
        })
        return
      }

      // Pending tokens are rendered via the floating overlay for smoother animation
    })

    return map
  }, [activeModel, correctAnswer, hoverTargets, modelAnswers, models, options, slamLabels])

  useEffect(() => {
    ;['modelA', 'modelB'].forEach((modelKey) => {
      const currentAnswer = modelAnswers?.[modelKey]
      const previousAnswer = prevAnswersRef.current[modelKey]
      if (currentAnswer && currentAnswer !== previousAnswer) {
        setSlamLabels((prev) => ({ ...prev, [modelKey]: currentAnswer }))
        if (slamTimeoutsRef.current[modelKey]) {
          clearTimeout(slamTimeoutsRef.current[modelKey])
        }
        slamTimeoutsRef.current[modelKey] = setTimeout(() => {
          setSlamLabels((prev) => {
            if (prev[modelKey] !== currentAnswer) return prev
            const next = { ...prev }
            delete next[modelKey]
            return next
          })
          slamTimeoutsRef.current[modelKey] = null
        }, 520)
      }
      if (!currentAnswer && previousAnswer) {
        setSlamLabels((prev) => {
          if (!(modelKey in prev)) return prev
          const next = { ...prev }
          delete next[modelKey]
          return next
        })
      }
      prevAnswersRef.current[modelKey] = currentAnswer ?? null
    })
  }, [modelAnswers])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    const nextState = { modelA: null, modelB: null }

    ;['modelA', 'modelB'].forEach((modelKey) => {
      if (modelAnswers?.[modelKey]) {
        nextState[modelKey] = null
        return
      }
      if (activeModel?.id !== modelKey) {
        nextState[modelKey] = null
        return
      }
      const targetLabel = hoverTargets[modelKey]
      const targetNode = targetLabel ? optionRefs.current[targetLabel] : null
      if (!targetNode) {
        nextState[modelKey] = null
        return
      }
      const rect = targetNode.getBoundingClientRect()
      const top = rect.top - containerRect.top + Math.min(rect.height, 56) * 0.5
      const left = rect.left - containerRect.left + 36
      nextState[modelKey] = {
        modelKey,
        top,
        left,
        pendingCountdown:
          countdown && Number.isFinite(countdown.seconds)
            ? {
                current: countdown.seconds,
                max: Number.isFinite(countdownMax) && countdownMax > 0 ? countdownMax : countdown.seconds,
              }
            : null,
      }
    })

    setFloatingTokens((previous) => {
      const isSame = ['modelA', 'modelB'].every((key) => {
        const prevToken = previous[key]
        const nextToken = nextState[key]
        if (!prevToken && !nextToken) return true
        if (!prevToken || !nextToken) return false
        const countdownChanged = (() => {
          const prevCountdown = prevToken.pendingCountdown
          const nextCountdown = nextToken.pendingCountdown
          if (!prevCountdown && !nextCountdown) return false
          if (!prevCountdown || !nextCountdown) return true
          return Math.abs((prevCountdown.current ?? 0) - (nextCountdown.current ?? 0)) > 0.05
        })()
        if (countdownChanged) return false
        return Math.abs(prevToken.top - nextToken.top) < 0.5 && Math.abs(prevToken.left - nextToken.left) < 0.5
      })
      if (isSame) return previous
      return nextState
    })
  }, [activeModel, hoverTargets, modelAnswers, countdown?.seconds, countdownMax, options])

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
      <div ref={containerRef} className="relative flex flex-col gap-3">
        <div className="pointer-events-none absolute inset-0 z-10">
          {['modelA', 'modelB'].map((modelKey) => {
            const floating = floatingTokens[modelKey]
            if (!floating) return null
            const info = models?.[modelKey] || {}
            const shortName = info.badgeLabel || info.shortName || info.id || modelKey.toUpperCase()
            const title = `${shortName} is hovering option ${hoverTargets[modelKey] || ''}`.trim()
            return (
              <div
                key={`floating-${modelKey}`}
                className="absolute z-20 transition-transform duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                style={{ transform: `translate(${floating.left - 16}px, ${floating.top - 16}px)` }}
              >
                <ModelToken
                  modelKey={modelKey}
                  state="pending"
                  shortName={shortName}
                  title={title}
                  pendingCountdown={floating.pendingCountdown}
                />
              </div>
            )
          })}
        </div>
        {options.map((option) => (
          <OptionCard
            key={option.label}
            ref={(node) => {
              if (node) {
                optionRefs.current[option.label] = node
              } else {
                delete optionRefs.current[option.label]
              }
            }}
            option={option}
            tokens={tokensByOption[option.label] || []}
            isCorrect={correctAnswer === option.label}
          />
        ))}
      </div>
    </section>
  )
}
