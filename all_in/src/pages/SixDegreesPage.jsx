import { useMemo, useState } from 'react'
import { getExperienceById } from '../config/experiences'
import { callRemoteChat } from '../lib/remoteChat'

const sixDegreesExperience = getExperienceById('sixdegrees')
const SYSTEM_PROMPT =
  sixDegreesExperience?.systemPrompt ||
  [
    'You are a playful parody writer. When given any text you respond with a witty parody of it.',
    'Keep responses concise (2-4 sentences) and ensure they clearly riff on the original idea.',
    'Avoid quoting the original verbatim; reshape it with humor and creative twists.',
  ].join(' ')

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export default function SixDegreesPage() {
  const [seed, setSeed] = useState('')
  const [error, setError] = useState('')
  const [iterations, setIterations] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const ready = useMemo(() => seed.trim().length > 0 && !isRunning, [seed, isRunning])

  async function runSixDegrees(event) {
    event.preventDefault()
    if (!sixDegreesExperience) {
      setError('Unable to load the Six Degrees experience configuration.')
      return
    }

    const trimmed = seed.trim()
    if (!trimmed) {
      setError('Please provide a sentence to parody.')
      return
    }

    setIsRunning(true)
    setError('')
    setActiveStep(0)
    setIterations([
      {
        label: 'Original spark',
        content: trimmed,
      },
    ])

    let previous = trimmed

    for (let degree = 1; degree <= 6; degree += 1) {
      setActiveStep(degree)

      try {
        const response = await callRemoteChat(
          sixDegreesExperience,
          [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: previous },
          ],
          { model: sixDegreesExperience.defaultModel }
        )

        previous = response.content.trim()
        setIterations((current) => [
          ...current,
          {
            label: `Degree ${degree}`,
            content: previous,
          },
        ])
      } catch (err) {
        console.error(err)
        setError(err?.message || 'Something went wrong while generating the parody.')
        break
      }

      if (degree < 6) {
        await wait(1000)
      }
    }

    setIsRunning(false)
    setActiveStep(0)
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4 rounded-3xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-purple-700 p-[1px]">
        <div className="rounded-[calc(1.5rem-1px)] bg-white/95 p-8 shadow-sm dark:bg-slate-900/90">
          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-500">Remix Lab</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Six Degrees Of Parody</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Start with a sentence and watch Groq parody it six times in a row. Each degree only sees the previous punchline, so
            the humor evolves right in front of you.
          </p>
          <form className="mt-6 space-y-4" onSubmit={runSixDegrees}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="six-degree-input">
              Enter your seed sentence
            </label>
            <textarea
              id="six-degree-input"
              className="w-full rounded-2xl border border-slate-300 bg-white/90 p-4 text-sm text-slate-800 shadow-sm transition focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
              rows={3}
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              placeholder="Example: Our office coffee machine just became self-aware."
              disabled={isRunning}
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!ready}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 px-5 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? 'Remixing…' : 'Run six degrees'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSeed('')
                  setIterations([])
                  setError('')
                  setActiveStep(0)
                }}
                className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-fuchsia-500 hover:text-fuchsia-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-400"
                disabled={isRunning && iterations.length <= 1}
              >
                Reset
              </button>
              {isRunning && (
                <span className="text-xs font-medium uppercase tracking-wide text-fuchsia-600 dark:text-fuchsia-400">
                  Generating degree {activeStep} of 6…
                </span>
              )}
            </div>
            {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}
          </form>
        </div>
      </header>

      {!!iterations.length && (
        <section className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Evolution timeline</h2>
          <ol className="space-y-4">
            {iterations.map((entry, index) => (
              <li
                key={`${entry.label}-${index}`}
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-fuchsia-500 dark:text-fuchsia-300">{entry.label}</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{entry.content}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{String(index).padStart(2, '0')}</span>
                </div>
                {index === iterations.length - 1 && isRunning && index < 6 && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-fuchsia-400 via-purple-500 to-purple-700 animate-pulse" />
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
