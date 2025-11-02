import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
const QUESTION_MODEL_ID = 'openai/gpt-oss-120b'
const MODEL_A_ID = 'openai/gpt-oss-20b'
const MODEL_B_ID = 'openai/gpt-oss-120b'
const COUNTDOWN_SECONDS = 5
const HISTORY_LIMIT = 5

const QUESTION_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          prompt: { type: 'string' },
          options: {
            type: 'array',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                label: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
                text: { type: 'string' },
              },
              required: ['label', 'text'],
            },
          },
          answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
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
    answer: { type: 'string', enum: ['A', 'B', 'C', 'D'] },
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
  const [abstractOpen, setAbstractOpen] = useState(false)
  const [activeModel, setActiveModel] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
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

  const callQuestionGenerator = useCallback(
    async ({ topic, article, baseUrl }) => {
      const promptLines = [
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
          const options = Array.isArray(item?.options)
            ? item.options
                .map((option, optionIndex) => ({
                  label: typeof option?.label === 'string' ? option.label.trim().slice(0, 1).toUpperCase() : ['A', 'B', 'C', 'D'][optionIndex] || 'A',
                  text: typeof option?.text === 'string' ? option.text.trim() : '',
                }))
                .filter((opt) => opt.label && opt.text)
            : []
          const paddedOptions = ['A', 'B', 'C', 'D'].map((letter, optionIndex) => {
            return options.find((opt) => opt.label === letter) || { label: letter, text: `Option ${letter} ${optionIndex + 1}` }
          })
          const answer = typeof item?.answer === 'string' ? item.answer.trim().toUpperCase() : 'A'
          return {
            id: `${Date.now()}-${index}`,
            prompt: promptText || `Question ${index + 1}`,
            options: paddedOptions,
            answer: ['A', 'B', 'C', 'D'].includes(answer) ? answer : 'A',
          }
        })
    },
    [],
  )

  const callAnswerModel = useCallback(
    async ({ question, modelId, baseUrl }) => {
      const optionsText = question.options
        .map((option) => `${option.label}. ${option.text}`)
        .join('\n')
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
      return ['A', 'B', 'C', 'D'].includes(raw) ? raw : null
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

  const appendHistory = useCallback((entry) => {
    if (!isMountedRef.current) return
    setHistory((prev) => {
      const next = [entry, ...prev]
      return next.slice(0, HISTORY_LIMIT)
    })
  }, [])

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

      setStatusSafely('Fetching the Wikipedia abstract…')
      const article = await fetchWikipediaSummary(topic.articleTitle)
      if (!isMountedRef.current) return
      setArticleInfo(article)

      setStatusSafely('Summoning the quizmaster…')
      const questionsList = await callQuestionGenerator({ topic, article, baseUrl: defaultBaseUrl })
      if (!questionsList.length) throw new Error('Question generation returned an empty set')
      if (!isMountedRef.current) return
      setQuestions(questionsList)

      await runCooldown('Model A is stretching before the buzzer…')

      for (let index = 0; index < questionsList.length; index += 1) {
        if (!isMountedRef.current) return
        setQuestionIndex(index)
        const question = questionsList[index]
        setStatusSafely(`Round ${index + 1}: Question deployed!`)
        setModelAnswers({ modelA: null, modelB: null })
        setActiveModel({ id: 'modelA' })

        setStatusSafely(`Model A is deliberating…`)
        const answerA = await callAnswerModel({ question, modelId: MODEL_A_ID, baseUrl: defaultBaseUrl })
        if (!isMountedRef.current) return
        setModelAnswers((prev) => ({ ...prev, modelA: answerA }))
        setActiveModel(null)
        await runCooldown('Cooling arena before Model B enters…')
        if (!isMountedRef.current) return

        setActiveModel({ id: 'modelB' })
        setStatusSafely(`Model B is calculating…`)
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

        await runCooldown('Resetting buzzers for the next volley…')
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
  }, [appendHistory, callAnswerModel, callQuestionGenerator, defaultBaseUrl, isRunning, resetActiveQuestion, runCooldown, setErrorSafely, setStatusSafely, updateScoreboard])

  const handleResetScoreboard = useCallback(() => {
    setScoreboard({ total: { modelA: 0, modelB: 0 }, categories: {} })
  }, [])

  const categoryBadge = currentCategoryMeta ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
      {currentCategoryMeta.label}
    </span>
  ) : null

  const summaryText = formatSummary(articleInfo?.extract || '')

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-4xl border border-slate-200/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-8 text-white shadow-2xl shadow-brand-500/20">
        <div className="absolute -top-24 right-0 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.5em] text-white/90">
              New Arena
            </span>
            <h1 className="text-4xl font-black sm:text-5xl">QA Arena · LLM Quiz Showdown</h1>
            <p className="max-w-2xl text-lg text-slate-100">
              Watch two Groq-hosted models clash over freshly minted questions from a random Wikipedia theme. Suspenseful cooldowns, live scoring, and a running highlight reel keep the arena electric.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={isRunning || !defaultBaseUrl}
                className="inline-flex items-center gap-2 rounded-full border border-transparent bg-gradient-to-r from-sky-500 via-purple-500 to-rose-500 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white shadow-lg shadow-sky-500/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRunning ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                ) : (
                  <PlayIcon className="h-5 w-5" />
                )}
                {isRunning ? 'Match in progress…' : 'Launch a new match'}
              </button>
              <button
                type="button"
                onClick={handleResetScoreboard}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40 hover:text-white"
              >
                <SparklesIcon className="h-4 w-4" />
                Reset scoreboard
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/60 p-4 text-sm text-slate-200 shadow-lg">
            <div className="flex items-center gap-2 text-slate-100">
              <ClockIcon className="h-5 w-5 text-sky-400" />
              <span className="text-sm font-semibold uppercase tracking-widest text-slate-300">5s cooldowns between calls</span>
            </div>
            <p className="text-xs text-slate-400">
              After each /obj request the arena pauses for {COUNTDOWN_SECONDS} seconds to respect rate limits. Countdown updates in real time so you feel the suspense.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-slate-200/20 bg-slate-900/40 p-6 text-white shadow-lg backdrop-blur-xl dark:border-slate-700/40">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-500">Current Article</p>
                <h2 className="text-2xl font-black text-white">{currentTheme ? currentTheme.theme : 'Awaiting selection'}</h2>
              </div>
              {categoryBadge}
            </header>
            {articleInfo ? (
              <div className="space-y-3 text-sm text-slate-200">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-slate-400">
                  <span>Wikipedia source</span>
                  <a
                    href={articleInfo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-sky-400/40 bg-sky-500/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100 transition hover:border-sky-300/60 hover:text-white"
                  >
                    Open article
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setAbstractOpen((open) => !open)}
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  <span>Article abstract</span>
                  {abstractOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </button>
                {abstractOpen ? (
                  <p className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-4 text-sm leading-relaxed text-slate-200">
                    {summaryText || 'No summary available for this article.'}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Spin up a match to load a random article and abstract.</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <QAArenaCountdown countdown={countdown} />
            <div className="rounded-3xl border border-slate-200/20 bg-slate-900/40 p-4 text-sm text-slate-200 shadow-inner backdrop-blur-xl dark:border-slate-700/40">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Arena Status</p>
              <p className="mt-2 text-base font-semibold text-white">{status || 'Press the button to start the battle!'}</p>
              {error ? (
                <p className="mt-2 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">{error}</p>
              ) : null}
            </div>
          </div>

          <QAArenaQuestionCard
            question={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={questions.length || 5}
            modelAnswers={modelAnswers}
            correctAnswer={currentQuestion?.answer}
            activeModel={activeModel}
          />
        </div>

        <div className="space-y-6">
          <QAArenaScoreboard scoreboard={scoreboard} />
          <QAArenaHistory history={history} />
        </div>
      </section>
    </div>
  )
}
