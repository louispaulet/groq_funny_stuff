import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { SparklesIcon, PlayIcon, ArrowPathIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { getExperienceById } from '../config/experiences'
import { normalizeBaseUrl } from '../lib/objectMakerUtils'
import { createRemoteObject } from '../lib/objectApi'
import { QAArenaScoreboard } from '../components/qaarena/QAArenaScoreboard'
import { QAArenaQuestionCard } from '../components/qaarena/QAArenaQuestionCard'
import { QAArenaHistory } from '../components/qaarena/QAArenaHistory'
import { QAArenaCountdown } from '../components/qaarena/QAArenaCountdown'
import { QA_ARENA_CATEGORIES, QA_ARENA_TOPICS, pickRandomTopic } from '../content/qaarenaTopics'

const EXPERIENCE_ID = 'qaarena'
const QUESTION_OBJECT_TYPE = 'qa_arena_round'
const ANSWER_OBJECT_TYPE = 'qa_arena_answer'
const MODEL_A_ID = 'openai/gpt-oss-20b'
const MODEL_B_ID = 'openai/gpt-oss-120b'
const RAW_ENV_QUIZ_MODEL_ID = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_QA_ARENA_QUIZ_MODEL_ID : undefined
const STRUCTURED_MODEL_PRIORITIES = [
  RAW_ENV_QUIZ_MODEL_ID,
  'moonshotai/kimi-k2-instruct-0905',
  'meta-llama/llama-4-maverick-17b',
  MODEL_A_ID,
  MODEL_B_ID,
].filter(Boolean)
const QUESTION_MODEL_ID = STRUCTURED_MODEL_PRIORITIES.find((candidate) => candidate !== MODEL_A_ID && candidate !== MODEL_B_ID) || MODEL_A_ID
const COUNTDOWN_SECONDS = 5
const HISTORY_LIMIT = 5
const ANSWER_LETTERS = ['A', 'B', 'C', 'D']
const QUESTION_SHUFFLE_MS = 1100

function buildModelMetadata(shortName, modelId) {
  const cleanId = typeof modelId === 'string' ? modelId.trim() : ''
  let provider = ''
  let name = cleanId
  if (cleanId.includes('/')) {
    const parts = cleanId.split('/')
    provider = parts.shift() || ''
    name = parts.join('/')
  }
  const uppercaseName = name ? name.replace(/[_]/g, '-').toUpperCase() : ''
  const display = provider && name ? `${provider} · ${name}` : cleanId
  const badgeLabel = uppercaseName ? `${shortName} · ${uppercaseName}` : shortName
  return {
    shortName,
    id: cleanId,
    provider,
    name,
    display,
    badgeLabel,
  }
}

const QUIZMASTER_METADATA = buildModelMetadata('Quizzer', QUESTION_MODEL_ID)

const MODEL_METADATA = {
  modelA: buildModelMetadata('Model A', MODEL_A_ID),
  modelB: buildModelMetadata('Model B', MODEL_B_ID),
}

const QUESTION_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          prompt: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                label: { type: 'string', enum: ANSWER_LETTERS },
                text: { type: 'string' },
              },
              required: ['label', 'text'],
            },
          },
          answer: { type: 'string', enum: ANSWER_LETTERS },
        },
        required: ['prompt', 'options', 'answer'],
      },
    },
  },
  required: ['questions'],
}

const ANSWER_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string', enum: ANSWER_LETTERS },
  },
  required: ['answer'],
}

function wait(ms) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout)
      resolve()
    }, ms)
  })
}

function formatSummary(summary) {
  if (!summary) return ''
  const trimmed = summary.trim()
  if (trimmed.length <= 900) return trimmed
  return `${trimmed.slice(0, 900)}…`
}

function getSecureRandomIndex(upperBound) {
  if (upperBound <= 0) return 0
  const cryptoSource = typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function' ? globalThis.crypto : null
  if (cryptoSource) {
    const maxUint32 = 0xffffffff
    const bucket = new Uint32Array(1)
    let randomFraction = 0
    do {
      cryptoSource.getRandomValues(bucket)
      randomFraction = bucket[0] / (maxUint32 + 1)
    } while (randomFraction >= 1)
    return Math.floor(randomFraction * upperBound)
  }
  return Math.floor(Math.random() * upperBound)
}

function shuffleArray(items) {
  const list = Array.isArray(items) ? [...items] : []
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = getSecureRandomIndex(index + 1)
    ;[list[index], list[swapIndex]] = [list[swapIndex], list[index]]
  }
  return list
}

async function fetchWikipediaSummary(articleTitle) {
  const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(articleTitle)}`
  const res = await fetch(endpoint)
  if (!res.ok) {
    throw new Error(`Wikipedia lookup failed (${res.status})`)
  }
  const payload = await res.json()
  return {
    title: payload?.title || articleTitle,
    extract: payload?.extract || '',
    url: payload?.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`,
  }
}

export default function QAArenaPage() {
  const experience = getExperienceById(EXPERIENCE_ID)
  const defaultBaseUrl = useMemo(() => normalizeBaseUrl(experience?.defaultBaseUrl || experience?.fallbackBaseUrl || ''), [experience])
  const [isRunning, setIsRunning] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(null)
  const [currentTheme, setCurrentTheme] = useState(null)
  const [articleInfo, setArticleInfo] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionIndex, setQuestionIndex] = useState(-1)
  const [modelAnswers, setModelAnswers] = useState({ modelA: null, modelB: null })
  const [scoreboard, setScoreboard] = useState({ total: { modelA: 0, modelB: 0 }, categories: {} })
  const [history, setHistory] = useState([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyHighlight, setHistoryHighlight] = useState(false)
  const [abstractOpen, setAbstractOpen] = useState(false)
  const [activeModel, setActiveModel] = useState(null)
  const [articleShuffleActive, setArticleShuffleActive] = useState(false)
  const [questionShuffleActive, setQuestionShuffleActive] = useState(false)
  const isMountedRef = useRef(true)
  const historyHighlightTimeoutRef = useRef(null)
  const articleShuffleTimeoutRef = useRef(null)
  const questionShuffleTimeoutRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (historyHighlightTimeoutRef.current) {
        clearTimeout(historyHighlightTimeoutRef.current)
      }
      if (articleShuffleTimeoutRef.current) {
        clearTimeout(articleShuffleTimeoutRef.current)
      }
      if (questionShuffleTimeoutRef.current) {
        clearTimeout(questionShuffleTimeoutRef.current)
      }
    }
  }, [])

  const currentQuestion = questionIndex >= 0 ? questions[questionIndex] : null
  const currentCategoryId = currentTheme?.categoryId
  const currentCategoryMeta = currentCategoryId ? QA_ARENA_CATEGORIES[currentCategoryId] : null

  const setCountdownSafely = useCallback((value) => {
    if (!isMountedRef.current) return
    setCountdown(value)
  }, [])

  const runCooldown = useCallback(async (label) => {
    for (let seconds = COUNTDOWN_SECONDS; seconds >= 1; seconds -= 1) {
      setCountdownSafely({ label, seconds })
      await wait(1000)
      if (!isMountedRef.current) return
    }
    setCountdownSafely(null)
  }, [setCountdownSafely])

  const setStatusSafely = useCallback((message) => {
    if (!isMountedRef.current) return
    setStatus(message)
  }, [])

  const setErrorSafely = useCallback((message) => {
    if (!isMountedRef.current) return
    setError(message)
  }, [])

  const triggerHistoryHighlight = useCallback(() => {
    if (!isMountedRef.current) return
    setHistoryHighlight(true)
    if (historyHighlightTimeoutRef.current) {
      clearTimeout(historyHighlightTimeoutRef.current)
    }
    historyHighlightTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setHistoryHighlight(false)
      historyHighlightTimeoutRef.current = null
    }, 1200)
  }, [])

  const triggerArticleShuffle = useCallback(() => {
    if (!isMountedRef.current) return
    setArticleShuffleActive(true)
    if (articleShuffleTimeoutRef.current) {
      clearTimeout(articleShuffleTimeoutRef.current)
    }
    articleShuffleTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setArticleShuffleActive(false)
      articleShuffleTimeoutRef.current = null
    }, QUESTION_SHUFFLE_MS)
  }, [])

  const triggerQuestionShuffle = useCallback(() => {
    if (!isMountedRef.current) return
    setQuestionShuffleActive(true)
    if (questionShuffleTimeoutRef.current) {
      clearTimeout(questionShuffleTimeoutRef.current)
    }
    questionShuffleTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      setQuestionShuffleActive(false)
      questionShuffleTimeoutRef.current = null
    }, QUESTION_SHUFFLE_MS)
  }, [])

  const callQuestionGenerator = useCallback(
    async ({ topic, article, baseUrl }) => {
      const promptLines = [
        // Only pass the chosen topic metadata and the article abstract to the quizmaster.
        'You are a competitive quiz composer creating five multiple-choice questions from a single Wikipedia summary.',
        'Only use the provided abstract—do not invent facts beyond it.',
        'Return exactly five questions. Each must have four options labelled A, B, C, D and indicate the correct answer letter.',
        'Keep prompts concise (max 200 characters) and ensure every incorrect answer is plausible but wrong.',
        `Topic: ${topic.theme}`,
        `Category: ${QA_ARENA_CATEGORIES[topic.categoryId]?.label || 'General Knowledge'}`,
        'Abstract:',
        article.extract,
      ]
      const prompt = promptLines.filter(Boolean).join('\n')
      const response = await createRemoteObject({
        baseUrl,
        objectType: QUESTION_OBJECT_TYPE,
        model: QUESTION_MODEL_ID,
        structure: QUESTION_STRUCTURE,
        prompt,
        strict: true,
      })
      const payload = response?.payload || {}
      const list = Array.isArray(payload.questions) ? payload.questions : []
      return list
        .slice(0, 5)
        .map((item, index) => {
          const promptText = typeof item?.prompt === 'string' ? item.prompt.trim() : ''
          const rawOptions = Array.isArray(item?.options)
            ? item.options
                .map((option, optionIndex) => ({
                  label: typeof option?.label === 'string' ? option.label.trim().slice(0, 1).toUpperCase() : ANSWER_LETTERS[optionIndex] || ANSWER_LETTERS[0],
                  text: typeof option?.text === 'string' ? option.text.trim() : '',
                }))
                .filter((opt) => opt.label && opt.text)
            : []
          const normalizedOptions = ANSWER_LETTERS.map((letter, optionIndex) => {
            const existing = rawOptions.find((opt) => opt.label === letter)
            const text = existing?.text || `Option ${letter} ${optionIndex + 1}`
            return { originalLabel: letter, text }
          })
          const answerLetter = typeof item?.answer === 'string' ? item.answer.trim().toUpperCase() : ''
          const originalCorrectOption =
            normalizedOptions.find((opt) => opt.originalLabel === answerLetter) || normalizedOptions[0]
          const shuffledOptions = shuffleArray(normalizedOptions)
          const reletteredOptions = shuffledOptions.map((opt, optionIndex) => ({
            label: ANSWER_LETTERS[optionIndex],
            text: opt.text,
          }))
          const correctIndex = shuffledOptions.findIndex((opt) => opt === originalCorrectOption)
          const resolvedAnswer = correctIndex >= 0 ? ANSWER_LETTERS[correctIndex] : ANSWER_LETTERS[0]
          return {
            id: `${Date.now()}-${index}`,
            prompt: promptText || `Question ${index + 1}`,
            options: reletteredOptions,
            answer: resolvedAnswer,
          }
        })
    },
    [],
  )

  const callAnswerModel = useCallback(
    async ({ question, modelId, baseUrl }) => {
      const optionsText = question.options.map((option) => `${option.label}. ${option.text}`).join('\n')
      const promptLines = [
        'You are competing in a multiple-choice quiz. Your answer must be a single capital letter: A, B, C, or D.',
        'Read the prompt carefully and pick the best answer using only the information provided.',
        'Return a JSON object with the key "answer" and the chosen letter. Do not include reasoning.',
        'Question:',
        question.prompt,
        'Options:',
        optionsText,
      ]
      const prompt = promptLines.filter(Boolean).join('\n')
      const response = await createRemoteObject({
        baseUrl,
        objectType: ANSWER_OBJECT_TYPE,
        structure: ANSWER_STRUCTURE,
        model: modelId,
        prompt,
        strict: true,
      })
      const payload = response?.payload || {}
      const raw = typeof payload.answer === 'string' ? payload.answer.trim().toUpperCase() : ''
      return ANSWER_LETTERS.includes(raw) ? raw : null
    },
    [],
  )

  const updateScoreboard = useCallback((categoryId, awardA, awardB) => {
    if (!isMountedRef.current) return
    setScoreboard((previous) => {
      const totalA = previous.total?.modelA ?? 0
      const totalB = previous.total?.modelB ?? 0
      const categories = { ...(previous.categories || {}) }
      const existingCategory = categories[categoryId] || { modelA: 0, modelB: 0 }
      const nextCategory = {
        modelA: existingCategory.modelA + (awardA ? 1 : 0),
        modelB: existingCategory.modelB + (awardB ? 1 : 0),
      }
      categories[categoryId] = nextCategory
      return {
        total: {
          modelA: totalA + (awardA ? 1 : 0),
          modelB: totalB + (awardB ? 1 : 0),
        },
        categories,
      }
    })
  }, [])

  const appendHistory = useCallback(
    (entry) => {
      if (!isMountedRef.current) return
      setHistory((prev) => {
        const next = [entry, ...prev]
        return next.slice(0, HISTORY_LIMIT)
      })
      triggerHistoryHighlight()
    },
    [triggerHistoryHighlight],
  )

  const resetActiveQuestion = useCallback(() => {
    if (!isMountedRef.current) return
    setModelAnswers({ modelA: null, modelB: null })
    setQuestionIndex(-1)
    setQuestions([])
  }, [])

  const handleStart = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setErrorSafely('')
    setStatusSafely('Spinning the topic wheel…')
    resetActiveQuestion()

    try {
      const topic = pickRandomTopic() || QA_ARENA_TOPICS[0]
      if (!topic) throw new Error('No topics configured')
      if (!isMountedRef.current) return
      setCurrentTheme(topic)
      triggerArticleShuffle()

      setStatusSafely('Fetching the Wikipedia abstract…')
      const article = await fetchWikipediaSummary(topic.articleTitle)
      if (!isMountedRef.current) return
      setArticleInfo(article)

      setStatusSafely('Summoning the quizmaster…')
      const questionsList = await callQuestionGenerator({ topic, article, baseUrl: defaultBaseUrl })
      if (!questionsList.length) throw new Error('Question generation returned an empty set')
      if (!isMountedRef.current) return
      setQuestions(questionsList)

      for (let index = 0; index < questionsList.length; index += 1) {
        if (!isMountedRef.current) return
        setQuestionIndex(index)
        triggerQuestionShuffle()
        const question = questionsList[index]
        setStatusSafely(`Round ${index + 1}: Question deployed!`)
        setModelAnswers({ modelA: null, modelB: null })
        await wait(QUESTION_SHUFFLE_MS)
        if (!isMountedRef.current) return
        setActiveModel({ id: 'modelA', phase: 'pending' })

        setStatusSafely('Model A is pacing the arena…')
        await runCooldown('Model A reveals their answer in')
        if (!isMountedRef.current) return
        const answerA = await callAnswerModel({ question, modelId: MODEL_A_ID, baseUrl: defaultBaseUrl })
        if (!isMountedRef.current) return
        setModelAnswers((prev) => ({ ...prev, modelA: answerA }))
        setActiveModel(null)

        setActiveModel({ id: 'modelB', phase: 'pending' })
        setStatusSafely('Model B is plotting their move…')
        await runCooldown('Model B reveals their answer in')
        if (!isMountedRef.current) return
        const answerB = await callAnswerModel({ question, modelId: MODEL_B_ID, baseUrl: defaultBaseUrl })
        if (!isMountedRef.current) return
        setModelAnswers((prev) => ({ ...prev, modelB: answerB }))
        setActiveModel(null)

        const correctAnswer = question.answer
        const awardA = answerA && answerA === correctAnswer
        const awardB = answerB && answerB === correctAnswer
        updateScoreboard(topic.categoryId, awardA, awardB)
        appendHistory({
          id: `${question.id}-${Date.now()}`,
          timestamp: Date.now(),
          theme: topic.theme,
          categoryId: topic.categoryId,
          question: question.prompt,
          answers: { modelA: answerA, modelB: answerB },
          correctAnswer,
        })

        await runCooldown('Review window—compare their answers before the next round…')
      }

      setStatusSafely('Match complete! Queue another duel when ready.')
    } catch (err) {
      console.error(err)
      setErrorSafely(err instanceof Error ? err.message : 'Arena malfunction encountered')
      setStatusSafely('The arena lights flicker—match aborted.')
    } finally {
      if (isMountedRef.current) {
        setActiveModel(null)
        setCountdown(null)
        setIsRunning(false)
      }
    }
  }, [appendHistory, callAnswerModel, callQuestionGenerator, defaultBaseUrl, isRunning, resetActiveQuestion, runCooldown, setErrorSafely, setStatusSafely, triggerArticleShuffle, triggerQuestionShuffle, updateScoreboard])

  const handleResetScoreboard = useCallback(() => {
    setScoreboard({ total: { modelA: 0, modelB: 0 }, categories: {} })
  }, [])

  const categoryBadge = currentCategoryMeta ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-white">
      {currentCategoryMeta.label}
    </span>
  ) : null

  const summaryText = formatSummary(articleInfo?.extract || '')

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-16 pt-6 md:px-6 lg:px-0">
      <section className="relative overflow-hidden rounded-4xl border border-slate-900/10 bg-white/95 px-6 py-8 text-slate-900 shadow-xl shadow-slate-900/10 dark:border-slate-700/60 dark:bg-slate-950 dark:text-white">
        <div className="absolute -top-28 right-6 h-60 w-60 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/30" aria-hidden="true" />
        <div className="absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-purple-400/15 blur-3xl dark:bg-purple-500/25" aria-hidden="true" />
        <div className="relative flex flex-col gap-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.5em] text-slate-700 dark:border-white/20 dark:bg-white/10 dark:text-white">
              New Arena
            </span>
            <h1 className="text-4xl font-black text-slate-900 sm:text-5xl dark:text-white">QA Arena · LLM Quiz Showdown</h1>
            <p className="max-w-3xl text-lg text-slate-600 dark:text-slate-200">
              Watch two Groq-hosted models clash over freshly minted questions from a random Wikipedia theme. Suspenseful cooldowns, live scoring, and a running highlight reel keep the arena electric.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={handleStart}
                disabled={isRunning || !defaultBaseUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-sky-500/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRunning ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : <PlayIcon className="h-5 w-5" />}
                {isRunning ? 'Match in progress…' : 'Launch a new match'}
              </button>
              <button
                type="button"
                onClick={handleResetScoreboard}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-700 shadow-sm transition hover:border-slate-900/20 hover:text-slate-900 dark:border-white/20 dark:bg-white/10 dark:text-white"
              >
                <SparklesIcon className="h-4 w-4" />
                Reset scoreboard
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-3xl border border-slate-900/10 bg-white/95 p-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500 dark:text-slate-400">Tonight&apos;s lineup</p>
              <div className="mt-3 flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">{QUIZMASTER_METADATA.shortName}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white" title={QUIZMASTER_METADATA.display}>
                    {QUIZMASTER_METADATA.display || QUIZMASTER_METADATA.id}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Generates every quiz round</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-300">{MODEL_METADATA.modelA.shortName}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white" title={MODEL_METADATA.modelA.display}>
                      {MODEL_METADATA.modelA.display || MODEL_METADATA.modelA.id}
                    </span>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    vs
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold uppercase tracking-widest text-rose-600 dark:text-rose-300">{MODEL_METADATA.modelB.shortName}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white" title={MODEL_METADATA.modelB.display}>
                      {MODEL_METADATA.modelB.display || MODEL_METADATA.modelB.id}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  Duel between {MODEL_METADATA.modelA.id} and {MODEL_METADATA.modelB.id}. Questions curated by {QUIZMASTER_METADATA.id}.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-900/10 bg-white/95 p-4 text-sm text-slate-700 shadow-sm dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <ClockIcon className="h-5 w-5 text-sky-500 dark:text-sky-300" />
                <span className="text-sm font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-300">{COUNTDOWN_SECONDS}s cooldowns between calls</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                After each /obj request the arena pauses for {COUNTDOWN_SECONDS} seconds to respect rate limits. Countdown updates in real time so you feel the suspense.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div
          className={clsx(
            'relative space-y-4 rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-slate-900 shadow-md shadow-slate-900/15 transition dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100',
            articleShuffleActive && 'ring-2 ring-sky-300/70 shadow-xl shadow-sky-200/30 animate-pulse dark:ring-sky-500/60 dark:shadow-sky-500/25',
          )}
        >
          {articleShuffleActive ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <span
                className="absolute -top-6 left-8 h-20 w-16 -rotate-6 rounded-2xl border border-slate-200/70 bg-white/75 shadow-lg shadow-slate-900/10 backdrop-blur-sm animate-bounce dark:border-slate-700/60 dark:bg-slate-800/60"
                style={{ animationDuration: '1.25s' }}
              />
              <span
                className="absolute -bottom-8 right-10 h-24 w-[4.25rem] rotate-6 rounded-2xl border border-slate-200/70 bg-slate-100/75 shadow-lg shadow-slate-900/10 backdrop-blur-sm animate-bounce dark:border-slate-700/60 dark:bg-slate-700/60"
                style={{ animationDelay: '0.12s', animationDuration: '1.35s' }}
              />
            </div>
          ) : null}
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">Current Article</p>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentTheme ? currentTheme.theme : 'Awaiting selection'}</h2>
            </div>
            {categoryBadge}
          </header>
          {articleInfo ? (
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <span>Wikipedia source</span>
                <a
                  href={articleInfo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-sky-400/70 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-700 transition hover:border-sky-400 hover:text-sky-900 dark:border-sky-400/60 dark:bg-sky-500/15 dark:text-sky-100"
                >
                  Open article
                </a>
              </div>
              <button
                type="button"
                onClick={() => setAbstractOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500"
              >
                <span>Article abstract</span>
                {abstractOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
              </button>
              {abstractOpen ? (
                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
                  {summaryText || 'No summary available for this article.'}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Spin up a match to load a random article and abstract.</p>
          )}
        </div>

        <QAArenaQuestionCard
          question={currentQuestion}
          questionIndex={questionIndex}
          totalQuestions={questions.length || 5}
          modelAnswers={modelAnswers}
          correctAnswer={currentQuestion?.answer}
          activeModel={activeModel}
          models={MODEL_METADATA}
          isShuffling={questionShuffleActive}
          countdown={countdown}
          countdownMax={COUNTDOWN_SECONDS}
        />

        <QAArenaCountdown countdown={countdown} />

        <div className="rounded-3xl border border-slate-900/10 bg-white/95 p-6 text-slate-900 shadow-md shadow-slate-900/15 dark:border-slate-700/60 dark:bg-slate-900/75 dark:text-slate-100">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500 dark:text-slate-400">Arena Status</p>
          <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{status || 'Press the button to start the battle!'}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Live updates appear here while the arena runs.</p>
          {error ? (
            <p className="mt-3 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-400/60 dark:bg-rose-500/15 dark:text-rose-100">
              {error}
            </p>
          ) : null}
        </div>

        <QAArenaScoreboard scoreboard={scoreboard} models={MODEL_METADATA} />

        <QAArenaHistory
          history={history}
          models={MODEL_METADATA}
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen((open) => !open)}
          isHighlighting={historyHighlight}
        />
      </section>
    </div>
  )
}
