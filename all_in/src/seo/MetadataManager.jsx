import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { experiences } from '../config/experiences'

const SITE_ORIGIN = 'https://groq-allin.thefrenchartist.dev'
const SITE_NAME = 'Groq AllIn Studio'
const DEFAULT_DESCRIPTION =
  'Groq AllIn Studio bundles specialist copilots, structured data labs, image generators, and playful experiments under one navigation shell.'

const STATIC_ROUTE_METADATA = {
  '/': {
    title: `${SITE_NAME} — Groq copilots, automation labs, and playful experiments`,
    description: DEFAULT_DESCRIPTION,
    keywords: 'Groq, AI copilots, structured data, image generation, playground',
  },
  '/about': {
    title: `About | ${SITE_NAME}`,
    description: 'Tour the Groq AllIn Studio architecture, worker routes, and experience catalog.',
    keywords: 'Groq AllIn Studio, about, architecture, worker routes, experiences',
  },
  '/profile': {
    title: `Profile | ${SITE_NAME}`,
    description: 'Review saved preferences, session details, and shortcuts for Groq AllIn Studio.',
    keywords: 'Groq AllIn Studio profile, saved preferences, user settings',
  },
  '/bank-holiday-planner': {
    title: `Bank Holiday Planner | ${SITE_NAME}`,
    description: 'Maximize PTO streaks with Groq-assisted holiday planning across five countries.',
    keywords: 'bank holiday planner, PTO optimizer, Groq structured data',
  },
  '/second-hand-food-market': {
    title: `Second-Hand Food Market | ${SITE_NAME}`,
    description: 'Browse a satirical second-hand food bazaar crafted with Groq storytelling components.',
    keywords: 'second hand food market, satire experience, Groq storytelling',
  },
  '/game-of-life-lab': {
    title: `Game of Life Lab | ${SITE_NAME}`,
    description: 'Experiment with Conway’s Game of Life presets, density stats, and live controls.',
    keywords: 'game of life lab, cellular automaton, interactive simulation',
  },
  '/dalle-vs-flux': {
    title: `DALL·E vs Flux Comparison | ${SITE_NAME}`,
    description: 'Compare DALL·E and Flux generations across 186 prompts in a curated research gallery.',
    keywords: 'DALL-E vs Flux, image comparison, Groq research gallery',
  },
  '/timeline-studio': {
    title: `Timeline Studio | ${SITE_NAME}`,
    description: 'Craft cinematic story arcs and exportable narrative cards powered by Groq structured outputs.',
    keywords: 'timeline studio, narrative design, Groq structured generation',
  },
  '/allergyfinder/cookies': {
    title: `AllergyFinder Cookie Editor | ${SITE_NAME}`,
    description: 'Manage allergy profiles and saved notes that personalize the AllergyFinder assistant.',
    keywords: 'AllergyFinder cookie editor, allergy profiles, Groq assistant',
  },
  '/objectmaker/zoo': {
    title: `Object Maker Zoo | ${SITE_NAME}`,
    description: 'Browse and reuse saved JSON objects created with Object Maker and Groq structured outputs.',
    keywords: 'Object Maker Zoo, JSON library, Groq structured outputs',
  },
  '/imagegen/gallery': {
    title: `Flux Image Gallery | ${SITE_NAME}`,
    description: 'Revisit saved Flux renders, prompts, and annotations from the image generator workspace.',
    keywords: 'Flux image gallery, saved renders, Groq image generation',
  },
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return '/'
  return pathname.endsWith('/') ? pathname.replace(/\/+$/, '') : pathname
}

function matchesExperience(pathname, experiencePath) {
  if (!experiencePath) return false
  if (pathname === experiencePath) return true
  return pathname.startsWith(`${experiencePath}/`)
}

function buildKeywords(keywords) {
  if (!keywords) return undefined
  return Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords
}

export function getMetadataForPath(pathname) {
  const normalizedPath = normalizePath(pathname)
  const explicit = STATIC_ROUTE_METADATA[normalizedPath]
  if (explicit) {
    return {
      title: explicit.title,
      description: explicit.description || DEFAULT_DESCRIPTION,
      keywords: buildKeywords(explicit.keywords),
      canonicalPath: explicit.canonicalPath,
    }
  }

  const matchedExperience = experiences.find((experience) =>
    matchesExperience(normalizedPath, experience.path)
  )

  if (matchedExperience) {
    const experienceName = matchedExperience.name || matchedExperience.id
    const title = `${experienceName} | ${SITE_NAME}`
    const description =
      matchedExperience.description ||
      matchedExperience.headline ||
      DEFAULT_DESCRIPTION
    const keywords = buildKeywords([
      experienceName,
      matchedExperience.badge,
      'Groq',
      'AI assistant',
      SITE_NAME,
    ])
    return {
      title,
      description,
      keywords,
      canonicalPath: matchedExperience.path,
    }
  }

  return {
    title: `${SITE_NAME} — Groq copilots, automation labs, and playful experiments`,
    description: DEFAULT_DESCRIPTION,
    keywords: 'Groq, AI copilots, structured data, image generation, playground',
    canonicalPath: '/',
  }
}

export default function MetadataManager() {
  const location = useLocation()
  const metadata = useMemo(() => getMetadataForPath(location.pathname), [location.pathname])
  const canonicalPath = metadata.canonicalPath || normalizePath(location.pathname)
  const canonicalUrl = SITE_ORIGIN
    ? `${SITE_ORIGIN}${canonicalPath === '/' ? '/' : canonicalPath}`
    : undefined

  return (
    <Helmet prioritizeSeoTags>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords ? <meta name="keywords" content={metadata.keywords} /> : null}
      <meta property="og:title" content={metadata.title} />
      <meta property="og:description" content={metadata.description} />
      <meta property="og:type" content="website" />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      <meta name="twitter:title" content={metadata.title} />
      <meta name="twitter:description" content={metadata.description} />
      <meta name="twitter:card" content="summary_large_image" />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
    </Helmet>
  )
}
