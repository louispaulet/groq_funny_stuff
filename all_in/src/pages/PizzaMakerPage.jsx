import { useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline'
import { callRemoteChat } from '../lib/remoteChat'
import {
  PIZZA_GALLERY_LIMIT,
  clearPizzaGallery,
  readPizzaGallery,
  writePizzaGallery,
} from '../lib/pizzaGalleryCookie'

const SIZE_OPTIONS = [
  { value: 'personal', label: 'Personal (8")' },
  { value: 'medium', label: 'Medium (12")' },
  { value: 'large', label: 'Large (16")' },
  { value: 'xl', label: 'Extra large (18")' },
]

const CRUST_OPTIONS = [
  { value: 'thin and crispy', label: 'Thin & crispy' },
  { value: 'hand-tossed', label: 'Hand-tossed' },
  { value: 'sourdough', label: 'Sourdough artisan' },
  { value: 'deep dish', label: 'Deep dish' },
]

const SAUCE_OPTIONS = [
  { value: 'slow simmered San Marzano tomato sauce', label: 'Tomato base' },
  { value: 'creamy roasted garlic white sauce', label: 'White base' },
  { value: 'pesto infused olive oil', label: 'Pesto base' },
]

const CHEESE_OPTIONS = [
  'fresh mozzarella',
  'aged provolone',
  'shaved parmesan',
  'buffalo mozzarella',
  'ricotta dollops',
  'vegan cashew cheese',
]

const TOPPING_OPTIONS = [
  { id: 'pepperoni', label: 'Pepperoni' },
  { id: 'wild-mushroom', label: 'Wild mushrooms' },
  { id: 'heirloom-tomato', label: 'Heirloom tomato' },
  { id: 'roasted-pepper', label: 'Roasted peppers' },
  { id: 'prosciutto', label: 'Prosciutto' },
  { id: 'basil', label: 'Fresh basil' },
  { id: 'arugula', label: 'Baby arugula' },
  { id: 'pineapple', label: 'Golden pineapple' },
  { id: 'olives', label: 'Castelvetrano olives' },
]

const AMOUNT_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'regular', label: 'Regular' },
  { value: 'extra', label: 'Extra' },
]

const PRESENTATION_OPTIONS = [
  { value: 'styled on a rustic wood board with fresh ingredients artfully scattered', label: 'Rustic board styling' },
  { value: 'served on a marble slab with elegant cutlery and a linen napkin', label: 'Modern marble plating' },
  { value: 'displayed inside a stone oven with glowing embers', label: 'Stone oven reveal' },
  { value: 'on a dark slate with overhead sprinkle of herbs and parmesan', label: 'Moody slate backdrop' },
]

const LIGHTING_OPTIONS = [
  { value: 'dramatic softbox studio lighting with controlled highlights', label: 'Studio softbox' },
  { value: 'warm golden hour lighting streaming through a window', label: 'Golden hour' },
  { value: 'crisp natural daylight with gentle shadows', label: 'Natural daylight' },
  { value: 'moody cinematic lighting with selective focus', label: 'Cinematic' },
]

function createTemplatePayload({
  size,
  crust,
  sauce,
  cheeses,
  toppingSelections,
  finishingNotes,
  presentation,
  lighting,
}) {
  const toppingLines = TOPPING_OPTIONS.filter((option) => toppingSelections[option.id]?.enabled)
    .map((option) => `- ${option.label}: ${toppingSelections[option.id].amount}`)

  return [
    'Create an imaginative yet photorealistic AI image prompt for a pizza photo shoot.',
    'Honor every detail from the configuration, emphasise gourmet styling, texture, and lighting.',
    'Limit the response to a single paragraph under 75 words with no lists or line breaks.',
    'Do not include camera brands or quotation marks.',
    '',
    'Pizza configuration:',
    `• Size: ${size}`,
    `• Crust: ${crust}`,
    `• Sauce: ${sauce}`,
    `• Cheeses: ${cheeses.length > 0 ? cheeses.join(', ') : 'none'}`,
    toppingLines.length > 0 ? '• Toppings:\n' + toppingLines.join('\n') : '• Toppings: none',
    `• Presentation: ${presentation}`,
    `• Lighting: ${lighting}`,
    finishingNotes ? `• Extra direction: ${finishingNotes}` : '• Extra direction: none',
  ]
    .filter(Boolean)
    .join('\n')
}

function summarizeConfiguration({ size, crust, sauce, cheeses, toppingSelections, presentation, lighting, finishingNotes }) {
  const enabledToppings = TOPPING_OPTIONS.filter((option) => toppingSelections[option.id]?.enabled)
  const toppingSummary =
    enabledToppings.length > 0
      ? enabledToppings
          .map((option) => `${option.label.toLowerCase()} (${toppingSelections[option.id].amount})`)
          .join(', ')
      : 'no additional toppings'

  const cheeseSummary = cheeses.length > 0 ? cheeses.join(', ') : 'no cheese'

  return `A ${size} pizza on ${crust} crust with ${sauce}, featuring ${cheeseSummary} and ${toppingSummary}. Styled ${presentation} under ${lighting}${
    finishingNotes ? `, with extra direction: ${finishingNotes}` : ''
  }.`
}

export default function PizzaMakerPage({ experience }) {
  const [size, setSize] = useState('medium')
  const [crust, setCrust] = useState('hand-tossed')
  const [sauce, setSauce] = useState(SAUCE_OPTIONS[0].value)
  const [cheeses, setCheeses] = useState(['fresh mozzarella'])
  const [toppingSelections, setToppingSelections] = useState(() =>
    TOPPING_OPTIONS.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.id]: { enabled: ['pepperoni', 'basil'].includes(option.id), amount: 'regular' },
      }),
      {},
    ),
  )
  const [presentation, setPresentation] = useState(PRESENTATION_OPTIONS[0].value)
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0].value)
  const [finishingNotes, setFinishingNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [promptResult, setPromptResult] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [gallery, setGallery] = useState([])

  useEffect(() => {
    setGallery(readPizzaGallery())
  }, [])

  const summary = useMemo(
    () =>
      summarizeConfiguration({
        size,
        crust,
        sauce,
        cheeses,
        toppingSelections,
        presentation,
        lighting,
        finishingNotes,
      }),
    [size, crust, sauce, cheeses, toppingSelections, presentation, lighting, finishingNotes],
  )

  const apiBaseUrl = (experience?.imageApiBaseUrl || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  function toggleCheese(cheese) {
    setCheeses((current) => {
      if (current.includes(cheese)) {
        return current.filter((item) => item !== cheese)
      }
      return [...current, cheese]
    })
  }

  function toggleTopping(id) {
    setToppingSelections((current) => ({
      ...current,
      [id]: { ...current[id], enabled: !current[id]?.enabled },
    }))
  }

  function updateToppingAmount(id, amount) {
    setToppingSelections((current) => ({
      ...current,
      [id]: { ...current[id], amount },
    }))
  }

  async function handleGenerate(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const template = createTemplatePayload({
        size,
        crust,
        sauce,
        cheeses,
        toppingSelections,
        presentation,
        lighting,
        finishingNotes,
      })

      const messages = [
        {
          role: 'system',
          content:
            'You are a Michelin-level food stylist who writes elite image prompts for photorealistic pizza photography. Respond with one sentence under 75 words capturing texture, ingredients, setting, and lighting.',
        },
        {
          role: 'user',
          content: template,
        },
      ]

      const chatResponse = await callRemoteChat(experience, messages, { model: experience?.defaultModel })
      const nextPrompt = typeof chatResponse?.content === 'string' ? chatResponse.content.trim() : ''
      if (!nextPrompt) {
        throw new Error('The prompt service returned an empty description.')
      }

      setPromptResult(nextPrompt)

      const requestUrl = new URL(`${apiBaseUrl}/flux/${encodeURIComponent(nextPrompt)}`)
      const response = await fetch(requestUrl.toString())
      if (!response.ok) {
        throw new Error(`Image generation failed with status ${response.status}`)
      }

      const payload = await response.json()
      const image = payload?.images?.[0]?.url
      if (!image) {
        throw new Error('The image service did not return a usable URL.')
      }

      setImageUrl(image)

      const createdAt = Date.now()
      const entry = {
        prompt: nextPrompt,
        url: image,
        summary,
        timestamp: createdAt,
      }

      setGallery((current) => {
        const filtered = current.filter((item) => item.url !== entry.url)
        const nextGallery = [entry, ...filtered].slice(0, PIZZA_GALLERY_LIMIT)
        writePizzaGallery(nextGallery)
        return nextGallery
      })
    } catch (err) {
      setImageUrl('')
      setPromptResult('')
      setError(err instanceof Error ? err.message : 'Unexpected error while generating your pizza image.')
    } finally {
      setLoading(false)
    }
  }

  function handleClearGallery() {
    clearPizzaGallery()
    setGallery([])
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        onSubmit={handleGenerate}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
      >
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configure your pizza</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dial in every detail, then let Groq draft a studio-grade prompt and render the pie on the right.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pizza-size" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Size
            </label>
            <select
              id="pizza-size"
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {SIZE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pizza-crust" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Crust style
            </label>
            <select
              id="pizza-crust"
              value={crust}
              onChange={(event) => setCrust(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {CRUST_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Sauce base</span>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {SAUCE_OPTIONS.map((option) => {
              const isActive = sauce === option.value
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSauce(option.value)}
                  className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-200'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Cheeses</span>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {CHEESE_OPTIONS.map((cheese) => {
              const active = cheeses.includes(cheese)
              return (
                <label
                  key={cheese}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm dark:border-brand-400 dark:bg-brand-500/10 dark:text-brand-200'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCheese(cheese)}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  {cheese}
                </label>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Toppings & intensity</span>
          <div className="space-y-2">
            {TOPPING_OPTIONS.map((option) => {
              const selection = toppingSelections[option.id]
              const active = selection?.enabled
              return (
                <div
                  key={option.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleTopping(option.id)}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${
                        active
                          ? 'bg-brand-600 text-white shadow hover:bg-brand-500'
                          : 'border border-slate-300 text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {active ? 'Included' : 'Add'}
                    </button>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{option.label}</span>
                  </div>
                  <div className="sm:w-40">
                    <label htmlFor={`${option.id}-amount`} className="sr-only">
                      {option.label} amount
                    </label>
                    <select
                      id={`${option.id}-amount`}
                      value={selection?.amount || 'regular'}
                      onChange={(event) => updateToppingAmount(option.id, event.target.value)}
                      disabled={!active}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
                    >
                      {AMOUNT_OPTIONS.map((amount) => (
                        <option key={amount.value} value={amount.value}>
                          {amount.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pizza-presentation" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Presentation style
            </label>
            <select
              id="pizza-presentation"
              value={presentation}
              onChange={(event) => setPresentation(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {PRESENTATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pizza-lighting" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Lighting direction
            </label>
            <select
              id="pizza-lighting"
              value={lighting}
              onChange={(event) => setLighting(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {LIGHTING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="pizza-notes" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Final direction
          </label>
          <textarea
            id="pizza-notes"
            value={finishingNotes}
            onChange={(event) => setFinishingNotes(event.target.value)}
            rows={3}
            placeholder="Any additional art direction or plating requests..."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:bg-brand-400 dark:focus-visible:ring-offset-slate-900"
          >
            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Baking…' : 'Bake this pizza image'}
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400">{summary}</p>
        </div>
      </form>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            Generated prompt
          </div>
          <div className="p-5">
            {promptResult ? (
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{promptResult}</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure your pie and click <span className="font-medium text-slate-700 dark:text-slate-200">Bake this pizza image</span> to see the LLM-crafted prompt.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            Pizza render
          </div>
          <div className="flex min-h-[320px] items-center justify-center bg-slate-100 dark:bg-slate-800">
            {imageUrl ? (
              <img src={imageUrl} alt={promptResult || 'Generated pizza'} className="h-full w-full object-cover" loading="lazy" />
            ) : loading ? (
              <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-brand-500" aria-hidden />
                Baking your pizza photo…
              </div>
            ) : (
              <p className="px-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Your pizza masterpiece will appear here once the image service finishes rendering.
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
            <span>Saved pizza gallery</span>
            {gallery.length > 0 ? (
              <button
                type="button"
                onClick={handleClearGallery}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-red-400 dark:hover:text-red-300"
              >
                <TrashIcon className="h-4 w-4" />
                Clear gallery
              </button>
            ) : null}
          </div>
          <div className="p-5">
            {gallery.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((entry) => (
                  <article
                    key={`${entry.url}-${entry.timestamp}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900/70"
                  >
                    <div className="relative h-40 w-full overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                      <img src={entry.url} alt={entry.prompt || 'Saved pizza render'} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="space-y-2 p-4">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-100">{entry.prompt || 'Saved pizza prompt'}</h3>
                      {entry.summary ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400">{entry.summary}</p>
                      ) : null}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.7rem] text-slate-400 dark:text-slate-500">
                        <span>{formatTimestamp(entry.timestamp)}</span>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 text-[0.7rem] font-medium text-slate-600 transition hover:border-brand-400 hover:text-brand-600 dark:border-slate-600 dark:text-slate-200"
                        >
                          Open ↗
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Every generated pizza is saved to a browser cookie so you can revisit it later. Bake a pie to see it here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
