import { useEffect, useMemo, useState } from 'react'
import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/outline'
import { callRemoteChat } from '../lib/remoteChat'
import { CAR_GALLERY_LIMIT, clearCarGallery, readCarGallery, writeCarGallery } from '../lib/carGalleryCookie'

const CUSTOM_BRAND_VALUE = '__custom__'

const BRAND_OPTIONS = [
  { value: 'Tesla', label: 'Tesla' },
  { value: 'Lamborghini', label: 'Lamborghini' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Bugatti', label: 'Bugatti' },
  { value: 'Aston Martin', label: 'Aston Martin' },
  { value: 'Pagani', label: 'Pagani' },
  { value: CUSTOM_BRAND_VALUE, label: 'Custom (follow your prompt)' },
]

const BODY_STYLE_OPTIONS = [
  { value: 'sleek two-door coupe', label: 'Coupe' },
  { value: 'low-slung roadster', label: 'Roadster' },
  { value: 'wide-body hypercar', label: 'Hypercar' },
  { value: 'muscular grand tourer', label: 'Grand tourer' },
  { value: 'futuristic concept car', label: 'Concept' },
  { value: 'lifted adventure rig', label: 'Adventure rig' },
]

const CAR_TYPE_OPTIONS = [
  { value: 'production supercar', label: 'Production supercar' },
  { value: 'bespoke concept car', label: 'Concept showpiece' },
  { value: 'vintage-inspired restomod', label: 'Restomod classic' },
  { value: 'electric performance car', label: 'Electric performance' },
  { value: 'off-road performance build', label: 'Off-road performance' },
]

const FINISH_OPTIONS = [
  { value: 'mirror-gloss paint with crisp reflections', label: 'Mirror gloss' },
  { value: 'satin paint with velvety highlights', label: 'Satin finish' },
  { value: 'matte paint with soft diffused reflections', label: 'Matte finish' },
  { value: 'color-shifting pearlescent paint', label: 'Pearlescent' },
]

const VIEWPOINT_OPTIONS = [
  { value: 'dramatic three-quarter front view', label: '3/4 front' },
  { value: 'side profile stance shot', label: 'Side profile' },
  { value: 'low angle hero shot', label: 'Low angle hero' },
  { value: 'rear three-quarter tracking shot', label: '3/4 rear' },
  { value: 'top-down showcase of the silhouette', label: 'Top-down' },
]

const SCENERY_OPTIONS = [
  { value: 'set against a misty mountain landscape', label: 'Mountain landscape' },
  { value: 'coasting beside a neon-lit city center', label: 'City center' },
  { value: 'parked on a coastal seascape overlook', label: 'Seascape overlook' },
  { value: 'charging within a futuristic studio environment', label: 'Futuristic studio' },
  { value: 'sprinting across a desert salt flat', label: 'Desert salt flat' },
]

const LIGHTING_OPTIONS = [
  { value: 'glowing golden hour lighting with long highlights', label: 'Golden hour' },
  { value: 'moody cinematic lighting with crisp rim lights', label: 'Cinematic' },
  { value: 'soft diffused studio lighting with controlled reflections', label: 'Soft studio' },
  { value: 'nocturnal lighting with neon accents and reflections', label: 'Neon night' },
  { value: 'clear daylight with sharp contrast and defined shadows', label: 'Clear daylight' },
]

const DETAIL_INTENSITY_OPTIONS = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'bold', label: 'Bold' },
]

const DETAIL_OPTIONS = [
  { id: 'aero-kit', label: 'Aerodynamic body kit', description: 'splitters, diffusers, and side skirts' },
  { id: 'light-trail', label: 'Motion light trails', description: 'streaks implying speed' },
  { id: 'door-style', label: 'Signature doors open', description: 'gullwing or scissor doors raised' },
  { id: 'wheel-glow', label: 'Illuminated wheel accents', description: 'glowing rims or brake calipers' },
  { id: 'graphic', label: 'Custom livery graphics', description: 'stripes, numbers, or sponsor decals' },
  { id: 'environmental-effects', label: 'Environmental effects', description: 'mist, dust, or water spray' },
]

function createTemplatePayload({
  brand,
  color,
  wheelCount,
  bodyStyle,
  carType,
  finish,
  viewpoint,
  scenery,
  lighting,
  detailSelections,
  finishingNotes,
}) {
  const details = DETAIL_OPTIONS.filter((option) => detailSelections[option.id]?.enabled).map(
    (option) => `- ${option.label}: ${detailSelections[option.id].intensity}`,
  )

  return [
    'Craft a vivid yet concise AI image prompt for an automotive exterior photoshoot.',
    'Describe only the visible design, stance, setting, and lighting—avoid mechanical specifications or interior commentary.',
    'Respond with one paragraph under 80 words and do not use lists or line breaks.',
    '',
    'Car configuration:',
    `• Brand: ${brand}`,
    `• Exterior color: ${color || 'unspecified'}`,
    `• Wheel count: ${wheelCount || 'unspecified'}`,
    `• Body style: ${bodyStyle}`,
    `• Car type: ${carType}`,
    `• Finish: ${finish}`,
    details.length > 0 ? '• Distinctive details:\n' + details.join('\n') : '• Distinctive details: none',
    `• Viewpoint: ${viewpoint}`,
    `• Scenery: ${scenery}`,
    `• Lighting: ${lighting}`,
    finishingNotes ? `• Extra direction: ${finishingNotes}` : '• Extra direction: none',
  ]
    .filter(Boolean)
    .join('\n')
}

function summarizeConfiguration({
  brand,
  color,
  wheelCount,
  bodyStyle,
  carType,
  finish,
  viewpoint,
  scenery,
  lighting,
  detailSelections,
  finishingNotes,
}) {
  const enabledDetails = DETAIL_OPTIONS.filter((option) => detailSelections[option.id]?.enabled)
  const detailsSummary =
    enabledDetails.length > 0
      ? enabledDetails
          .map((option) => `${option.label.toLowerCase()} (${detailSelections[option.id].intensity})`)
          .join(', ')
      : 'no extra flourishes'

  const wheelsLabel = (() => {
    if (typeof wheelCount === 'number') {
      return Number.isFinite(wheelCount) ? `${wheelCount}-wheel` : 'custom-wheel'
    }
    const trimmed = typeof wheelCount === 'string' ? wheelCount.trim() : ''
    return trimmed ? `${trimmed}-wheel` : 'custom-wheel'
  })()

  return [
    `A ${brand} ${bodyStyle} portrayed as a ${carType}`,
    `finished in ${color || 'a custom hue'} with ${finish}`,
    `shown from a ${viewpoint} in ${scenery}`,
    `under ${lighting}, featuring ${detailsSummary}`,
    finishingNotes ? `extra direction: ${finishingNotes}` : null,
    `wheel setup: ${wheelsLabel}`,
  ]
    .filter(Boolean)
    .join(', ')
}

export default function CarMakerPage({ experience }) {
  const [brandChoice, setBrandChoice] = useState(BRAND_OPTIONS[0].value)
  const [customBrand, setCustomBrand] = useState('')
  const [color, setColor] = useState('candy apple red')
  const [wheelCount, setWheelCount] = useState('4')
  const [bodyStyle, setBodyStyle] = useState(BODY_STYLE_OPTIONS[0].value)
  const [carType, setCarType] = useState(CAR_TYPE_OPTIONS[0].value)
  const [finish, setFinish] = useState(FINISH_OPTIONS[0].value)
  const [viewpoint, setViewpoint] = useState(VIEWPOINT_OPTIONS[0].value)
  const [scenery, setScenery] = useState(SCENERY_OPTIONS[0].value)
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0].value)
  const [detailSelections, setDetailSelections] = useState(() =>
    DETAIL_OPTIONS.reduce(
      (accumulator, option) => ({
        ...accumulator,
        [option.id]: { enabled: ['aero-kit', 'graphic'].includes(option.id), intensity: 'balanced' },
      }),
      {},
    ),
  )
  const [finishingNotes, setFinishingNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [promptResult, setPromptResult] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [gallery, setGallery] = useState([])

  const resolvedBrand =
    brandChoice === CUSTOM_BRAND_VALUE
      ? customBrand.trim() || 'bespoke concept car brand guided by the prompt'
      : brandChoice

  useEffect(() => {
    setGallery(readCarGallery())
  }, [])

  const summary = useMemo(
    () =>
      summarizeConfiguration({
        brand: resolvedBrand,
        color,
        wheelCount,
        bodyStyle,
        carType,
        finish,
        viewpoint,
        scenery,
        lighting,
        detailSelections,
        finishingNotes,
      }),
    [
      resolvedBrand,
      color,
      wheelCount,
      bodyStyle,
      carType,
      finish,
      viewpoint,
      scenery,
      lighting,
      detailSelections,
      finishingNotes,
    ],
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

  function toggleDetail(id) {
    setDetailSelections((current) => ({
      ...current,
      [id]: { ...current[id], enabled: !current[id]?.enabled },
    }))
  }

  function updateDetailIntensity(id, intensity) {
    setDetailSelections((current) => ({
      ...current,
      [id]: { ...current[id], intensity },
    }))
  }

  async function handleGenerate(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const template = createTemplatePayload({
        brand: resolvedBrand,
        color,
        wheelCount: wheelCount.trim(),
        bodyStyle,
        carType,
        finish,
        viewpoint,
        scenery,
        lighting,
        detailSelections,
        finishingNotes,
      })

      const messages = [
        {
          role: 'system',
          content:
            'You are an automotive exterior stylist who writes high-end image prompts for hero car photography. Focus on what is visible and cinematic without mentioning internal mechanics.',
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
        const nextGallery = [entry, ...filtered].slice(0, CAR_GALLERY_LIMIT)
        writeCarGallery(nextGallery)
        return nextGallery
      })
    } catch (err) {
      setImageUrl('')
      setPromptResult('')
      setError(err instanceof Error ? err.message : 'Unexpected error while generating your car image.')
    } finally {
      setLoading(false)
    }
  }

  function handleClearGallery() {
    clearCarGallery()
    setGallery([])
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <form
        onSubmit={handleGenerate}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
      >
        <header className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configure your hero car</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Shape every visible detail, then let Groq author a cinematic prompt and render the shot on the right.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="car-brand" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Brand
            </label>
            <select
              id="car-brand"
              value={brandChoice}
              onChange={(event) => setBrandChoice(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {BRAND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {brandChoice === CUSTOM_BRAND_VALUE ? (
              <div className="mt-3 space-y-2">
                <label
                  htmlFor="car-brand-custom"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Custom brand direction
                </label>
                <input
                  id="car-brand-custom"
                  type="text"
                  value={customBrand}
                  onChange={(event) => setCustomBrand(event.target.value)}
                  placeholder="e.g. art-deco inspired electric marque"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave blank to let Groq invent a marque that matches your prompt.
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <label htmlFor="car-color" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Exterior color
            </label>
            <input
              id="car-color"
              type="text"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="e.g. deep sapphire blue"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="car-body-style" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Body style
            </label>
            <select
              id="car-body-style"
              value={bodyStyle}
              onChange={(event) => setBodyStyle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {BODY_STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="car-type" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Car type
            </label>
            <select
              id="car-type"
              value={carType}
              onChange={(event) => setCarType(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {CAR_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="car-wheels" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Number of wheels
            </label>
            <input
              id="car-wheels"
              type="number"
              min="0"
              value={wheelCount}
              onChange={(event) => setWheelCount(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enter any wheel count—even unconventional ones.</p>
          </div>

          <div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Paint finish</span>
            <div className="mt-3 grid gap-2">
              {FINISH_OPTIONS.map((option) => {
                const isActive = finish === option.value
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setFinish(option.value)}
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
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="car-viewpoint" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Viewpoint
            </label>
            <select
              id="car-viewpoint"
              value={viewpoint}
              onChange={(event) => setViewpoint(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {VIEWPOINT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="car-scenery" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Scenery
            </label>
            <select
              id="car-scenery"
              value={scenery}
              onChange={(event) => setScenery(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              {SCENERY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="car-lighting" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Lighting
          </label>
          <select
            id="car-lighting"
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

        <div className="space-y-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Signature details</span>
          <div className="space-y-2">
            {DETAIL_OPTIONS.map((option) => {
              const selection = detailSelections[option.id]
              const active = selection?.enabled
              return (
                <div
                  key={option.id}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/70 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDetail(option.id)}
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition ${
                        active
                          ? 'bg-brand-600 text-white shadow hover:bg-brand-500'
                          : 'border border-slate-300 text-slate-600 hover:border-brand-300 hover:text-brand-600 dark:border-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {active ? 'Included' : 'Add'}
                    </button>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{option.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Intensity
                    </label>
                    <select
                      value={selection?.intensity || 'balanced'}
                      onChange={(event) => updateDetailIntensity(option.id, event.target.value)}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    >
                      {DETAIL_INTENSITY_OPTIONS.map((intensity) => (
                        <option key={intensity.value} value={intensity.value}>
                          {intensity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="car-notes" className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Extra direction
          </label>
          <textarea
            id="car-notes"
            value={finishingNotes}
            onChange={(event) => setFinishingNotes(event.target.value)}
            rows={3}
            placeholder="Optional styling notes visible from the exterior..."
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400/40 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:cursor-not-allowed disabled:bg-brand-400"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
                Generating…
              </>
            ) : (
              'Generate car image'
            )}
          </button>

          <button
            type="button"
            onClick={handleClearGallery}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-red-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 dark:border-slate-600 dark:text-slate-300"
          >
            <TrashIcon className="h-4 w-4" aria-hidden="true" />
            Clear gallery
          </button>
        </div>

        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 shadow-inner dark:bg-slate-900/40 dark:text-slate-300">
          <p className="font-medium text-slate-700 dark:text-slate-100">Quick summary</p>
          <p className="mt-1 leading-relaxed">{summary}</p>
        </div>
      </form>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              Prompt & render
            </h3>
          </header>
          <div className="space-y-4 p-5">
            {promptResult ? (
              <article className="space-y-3">
                <div className="rounded-lg border border-slate-200 bg-white/90 p-3 text-sm leading-relaxed text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
                  {promptResult}
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

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white/70 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
          <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-slate-700 dark:bg-slate-900/40">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Car gallery</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Recent renders are stored in a cookie on this device.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {gallery.length}/{CAR_GALLERY_LIMIT}
            </span>
          </header>
          {gallery.length > 0 ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {gallery.map((entry) => (
                <li key={entry.url} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                  <img
                    src={entry.url}
                    alt="Saved hero car render"
                    className="h-32 w-full rounded-xl border border-slate-200 object-cover shadow-sm sm:h-24 sm:w-40 dark:border-slate-700"
                  />
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{entry.summary}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.prompt}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Saved {formatTimestamp(entry.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">Generate a car to begin filling your gallery.</p>
          )}
        </section>
      </div>
    </section>
  )
}

