import { afterEach, describe, expect, test, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './theme'
import { experiences } from './config/experiences'
import App from './App'

vi.mock('./components/layout/AppShell', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="app-shell">{children}</div>,
}))

vi.mock('./pages/HomePage', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">home</div>,
}))

vi.mock('./pages/AboutPage', () => ({
  __esModule: true,
  default: () => <div data-testid="about-page">about</div>,
}))

vi.mock('./pages/ProfilePage', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-page">profile</div>,
}))

vi.mock('./pages/BankHolidayPlannerPage', () => ({
  __esModule: true,
  default: () => <div data-testid="bank-holiday-planner">bank</div>,
}))

vi.mock('./pages/SecondHandFoodMarketPage', () => ({
  __esModule: true,
  default: () => <div data-testid="second-hand-food">second</div>,
}))

vi.mock('./pages/GameOfLifeLabPage', () => ({
  __esModule: true,
  default: () => <div data-testid="game-of-life-lab">life</div>,
}))

vi.mock('./pages/DalleVsFluxPage', () => ({
  __esModule: true,
  default: () => <div data-testid="dalle-vs-flux">dalle</div>,
}))

vi.mock('./pages/TimelineStudioPage', () => ({
  __esModule: true,
  default: () => <div data-testid="timeline-studio">timeline</div>,
}))

vi.mock('./pages/NewsAnalyzerPage', () => ({
  __esModule: true,
  default: () => <div data-testid="news-analyzer">news</div>,
}))

vi.mock('./pages/SixDegreesPage', () => ({
  __esModule: true,
  default: () => <div data-testid="six-degrees">six</div>,
}))

vi.mock('./pages/PongShowdownPage', () => ({
  __esModule: true,
  default: () => <div data-testid="pong-showdown">pong</div>,
}))

vi.mock('./pages/ObjectMakerBuilder', () => ({
  __esModule: true,
  default: () => <div data-testid="object-maker-builder">builder</div>,
}))

vi.mock('./pages/ObjectMakerZoo', () => ({
  __esModule: true,
  default: () => <div data-testid="object-maker-zoo">zoo</div>,
}))

vi.mock('./pages/ImageGeneratorPage', () => ({
  __esModule: true,
  default: ({ experience }) => <div data-testid="image-generator">{experience?.id}</div>,
}))

vi.mock('./pages/ImageGalleryPage', () => ({
  __esModule: true,
  default: () => <div data-testid="image-gallery">gallery</div>,
}))

vi.mock('./pages/PizzaMakerPage', () => ({
  __esModule: true,
  default: () => <div data-testid="pizza-maker">pizza</div>,
}))

vi.mock('./pages/CarMakerPage', () => ({
  __esModule: true,
  default: () => <div data-testid="car-maker">car</div>,
}))

vi.mock('./pages/SvgPlaygroundPage', () => ({
  __esModule: true,
  default: ({ experience }) => <div data-testid="svg-playground">{experience?.id}</div>,
}))

vi.mock('./pages/MermaidStudioPage', () => ({
  __esModule: true,
  default: ({ experience }) => <div data-testid="mermaid-studio">{experience?.id}</div>,
}))

vi.mock('./pages/FlagFoundryPage', () => ({
  __esModule: true,
  default: ({ experience }) => <div data-testid="flag-foundry">{experience?.id}</div>,
}))

vi.mock('./components/allergyfinder/AllergyCookieEditor', () => ({
  __esModule: true,
  default: () => <div data-testid="allergy-cookie-editor">cookie</div>,
}))

vi.mock('./components/allergyfinder/AllergyFinderNav', () => ({
  __esModule: true,
  default: () => <div data-testid="allergy-nav">nav</div>,
}))

vi.mock('./components/objectmaker/ObjectMakerNav', () => ({
  __esModule: true,
  default: () => <div data-testid="objectmaker-nav">nav</div>,
}))

vi.mock('./components/imagegen/ImageGeneratorNav', () => ({
  __esModule: true,
  default: () => <div data-testid="imagegen-nav">nav</div>,
}))

vi.mock('./components/chat/ChatExperience', () => ({
  __esModule: true,
  default: ({ experience }) => <div data-testid={`chat-experience-${experience?.id}`}>chat</div>,
}))

vi.mock('./pages/ExperiencePage', () => ({
  __esModule: true,
  default: ({ experience, children, navigation }) => (
    <div data-testid={`experience-page-${experience?.id || 'missing'}`}>
      {navigation ? <div data-testid="experience-navigation">{navigation}</div> : null}
      {children}
    </div>
  ),
}))

vi.mock('./components/ScrollToTop', () => ({
  __esModule: true,
  default: () => null,
}))

afterEach(() => {
  cleanup()
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', '/')
  }
})

describe('App routing', () => {
  function renderAt(path) {
    if (typeof window !== 'undefined') {
      const targetPath = path.startsWith('/') ? path : `/${path}`
      window.history.pushState({}, '', targetPath)
    }
    return render(
      <HelmetProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </HelmetProvider>
    )
  }

  test('renders the home overview', () => {
    renderAt('/')
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  test('renders static top-level routes', () => {
    renderAt('/about')
    expect(screen.getByTestId('about-page')).toBeInTheDocument()

    renderAt('/profile')
    expect(screen.getByTestId('profile-page')).toBeInTheDocument()

    renderAt('/bank-holiday-planner')
    expect(screen.getByTestId('bank-holiday-planner')).toBeInTheDocument()

    renderAt('/second-hand-food-market')
    expect(screen.getByTestId('second-hand-food')).toBeInTheDocument()

    renderAt('/game-of-life-lab')
    expect(screen.getByTestId('game-of-life-lab')).toBeInTheDocument()

    renderAt('/dalle-vs-flux')
    expect(screen.getByTestId('dalle-vs-flux')).toBeInTheDocument()

    renderAt('/timeline-studio')
    expect(screen.getByTestId('timeline-studio')).toBeInTheDocument()
  })

  test('renders workspace specific pages', () => {
    renderAt('/newsanalyzer')
    expect(screen.getByTestId('news-analyzer')).toBeInTheDocument()

    renderAt('/six-degrees')
    expect(screen.getByTestId('six-degrees')).toBeInTheDocument()

    renderAt('/pong-showdown')
    expect(screen.getByTestId('pong-showdown')).toBeInTheDocument()
  })

  test('mounts allergyfinder routes with navigation and chat', () => {
    const allergyfinder = experiences.find((exp) => exp.id === 'allergyfinder')
    renderAt(allergyfinder.path)
    expect(screen.getByTestId('experience-page-allergyfinder')).toBeInTheDocument()
    expect(screen.getByTestId('allergy-nav')).toBeInTheDocument()
    expect(screen.getByTestId('chat-experience-allergyfinder')).toBeInTheDocument()

    cleanup()
    renderAt(`${allergyfinder.path}/cookies`)
    expect(screen.getByTestId('experience-page-allergyfinder')).toBeInTheDocument()
    expect(screen.getByTestId('allergy-cookie-editor')).toBeInTheDocument()
  })

  test('mounts object maker builder and zoo', () => {
    const objectMaker = experiences.find((exp) => exp.id === 'objectmaker')
    renderAt(objectMaker.path)
    expect(screen.getByTestId('objectmaker-nav')).toBeInTheDocument()
    expect(screen.getByTestId('object-maker-builder')).toBeInTheDocument()

    renderAt(`${objectMaker.path}/zoo`)
    expect(screen.getByTestId('object-maker-zoo')).toBeInTheDocument()
  })

  test('mounts image generator and gallery routes', () => {
    const imagegen = experiences.find((exp) => exp.id === 'imagegen')
    renderAt(imagegen.path)
    expect(screen.getByTestId('imagegen-nav')).toBeInTheDocument()
    expect(screen.getByTestId('image-generator')).toHaveTextContent('imagegen')

    renderAt(`${imagegen.path}/gallery`)
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument()
  })

  test('mounts dedicated studio experiences', () => {
    const svg = experiences.find((exp) => exp.id === 'svglab')
    renderAt(svg.path)
    expect(screen.getByTestId('svg-playground')).toHaveTextContent('svglab')

    const mermaid = experiences.find((exp) => exp.id === 'mermaidstudio')
    renderAt(mermaid.path)
    expect(screen.getByTestId('mermaid-studio')).toHaveTextContent('mermaidstudio')

    const flag = experiences.find((exp) => exp.id === 'flagfoundry')
    renderAt(flag.path)
    expect(screen.getByTestId('flag-foundry')).toHaveTextContent('flagfoundry')

    const pizza = experiences.find((exp) => exp.id === 'pizzamaker')
    renderAt(pizza.path)
    expect(screen.getByTestId('pizza-maker')).toBeInTheDocument()

    const car = experiences.find((exp) => exp.id === 'carmaker')
    renderAt(car.path)
    expect(screen.getByTestId('car-maker')).toBeInTheDocument()
  })

  test('renders chat workspaces for remaining experiences', () => {
    const specialIds = new Set([
      'allergyfinder',
      'objectmaker',
      'imagegen',
      'svglab',
      'emotionfoundry',
      'mermaidstudio',
      'flagfoundry',
      'pizzamaker',
      'carmaker',
      'newsanalyzer',
      'sixdegrees',
      'pongshowdown',
      'timelinestudio',
    ])

    const chatExperiences = experiences.filter((exp) => !specialIds.has(exp.id))

    chatExperiences.forEach((exp) => {
      renderAt(exp.path)
      expect(
        screen.getByTestId(`experience-page-${exp.id}`)
      ).toBeInTheDocument()
      expect(
        screen.getByTestId(`chat-experience-${exp.id}`)
      ).toBeInTheDocument()
    })
  })
})
