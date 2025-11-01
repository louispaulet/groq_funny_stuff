import { Fragment, useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ExperiencePage from './pages/ExperiencePage'
import AboutPage from './pages/AboutPage'
import ChatExperience from './components/chat/ChatExperience'
import { ThemeProvider } from './theme'
import { experiences } from './config/experiences'
import AllergyCookieEditor from './components/allergyfinder/AllergyCookieEditor'
import AllergyFinderNav from './components/allergyfinder/AllergyFinderNav'
import ProfilePage from './pages/ProfilePage'
import ObjectMakerNav from './components/objectmaker/ObjectMakerNav'
import ObjectMakerBuilder from './pages/ObjectMakerBuilder'
import ObjectMakerZoo from './pages/ObjectMakerZoo'
import BankHolidayPlannerPage from './pages/BankHolidayPlannerPage'
import NewsAnalyzerPage from './pages/NewsAnalyzerPage'
import SixDegreesPage from './pages/SixDegreesPage'
import ImageGeneratorPage from './pages/ImageGeneratorPage'
import ImageGalleryPage from './pages/ImageGalleryPage'
import GameOfLifeLabPage from './pages/GameOfLifeLabPage'
import ImageGeneratorNav from './components/imagegen/ImageGeneratorNav'
import PizzaMakerPage from './pages/PizzaMakerPage'
import CarMakerPage from './pages/CarMakerPage'
import SvgPlaygroundPage from './pages/SvgPlaygroundPage'
import FlagFoundryPage from './pages/FlagFoundryPage'
import EmotionEmojiFoundryPage from './pages/EmotionEmojiFoundryPage'
import SecondHandFoodMarketPage from './pages/SecondHandFoodMarketPage'
import PongShowdownPage from './pages/PongShowdownPage'
import DalleVsFluxPage from './pages/DalleVsFluxPage'
import MermaidStudioPage from './pages/MermaidStudioPage'
import TimelineStudioPage from './pages/TimelineStudioPage'
import ScrollToTop from './components/ScrollToTop'

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

function getMetadataForPath(pathname) {
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

function MetadataManager() {
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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MetadataManager />
        <ScrollToTop />
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bank-holiday-planner" element={<BankHolidayPlannerPage />} />
            <Route path="/second-hand-food-market" element={<SecondHandFoodMarketPage />} />
            <Route path="/game-of-life-lab" element={<GameOfLifeLabPage />} />
            <Route path="/dalle-vs-flux" element={<DalleVsFluxPage />} />
            <Route path="/timeline-studio" element={<TimelineStudioPage />} />
            {experiences.map((experience) =>
              experience.id === 'allergyfinder' ? (
                <Fragment key={experience.id}>
                  <Route
                    path={experience.path}
                    element={(
                      <ExperiencePage experience={experience} navigation={<AllergyFinderNav />}>
                        <ChatExperience experience={experience} />
                      </ExperiencePage>
                    )}
                  />
                  <Route
                    path={`${experience.path}/cookies`}
                    element={(
                      <ExperiencePage experience={experience} navigation={<AllergyFinderNav />}>
                        <AllergyCookieEditor />
                      </ExperiencePage>
                    )}
                  />
                </Fragment>
              ) : experience.id === 'objectmaker' ? (
                <Fragment key={experience.id}>
                  <Route
                    path={experience.path}
                    element={(
                      <ExperiencePage experience={experience} navigation={<ObjectMakerNav />}>
                        <ObjectMakerBuilder />
                      </ExperiencePage>
                    )}
                  />
                  <Route
                    path={`${experience.path}/zoo`}
                    element={(
                      <ExperiencePage experience={experience} navigation={<ObjectMakerNav />}>
                        <ObjectMakerZoo />
                      </ExperiencePage>
                    )}
                  />
                </Fragment>
              ) : experience.id === 'imagegen' ? (
                <Fragment key={experience.id}>
                  <Route
                    path={experience.path}
                    element={(
                      <ExperiencePage experience={experience} navigation={<ImageGeneratorNav />}>
                        <ImageGeneratorPage experience={experience} />
                      </ExperiencePage>
                    )}
                  />
                  <Route
                    path={`${experience.path}/gallery`}
                    element={(
                      <ExperiencePage experience={experience} navigation={<ImageGeneratorNav />}>
                        <ImageGalleryPage />
                      </ExperiencePage>
                    )}
                  />
                </Fragment>
              ) : experience.id === 'svglab' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <SvgPlaygroundPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'mermaidstudio' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <MermaidStudioPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'flagfoundry' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <FlagFoundryPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'emotionfoundry' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <EmotionEmojiFoundryPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'pizzamaker' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <PizzaMakerPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'carmaker' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <CarMakerPage experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ) : experience.id === 'newsanalyzer' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={<NewsAnalyzerPage />}
                />
              ) : experience.id === 'sixdegrees' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={<SixDegreesPage />}
                />
              ) : experience.id === 'pongshowdown' ? (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={<PongShowdownPage />}
                />
              ) : (
                <Route
                  key={experience.id}
                  path={experience.path}
                  element={(
                    <ExperiencePage experience={experience}>
                      <ChatExperience experience={experience} />
                    </ExperiencePage>
                  )}
                />
              ),
            )}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
