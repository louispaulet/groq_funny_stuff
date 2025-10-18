import { Fragment } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import SecondHandFoodMarketPage from './pages/SecondHandFoodMarketPage'
import PongShowdownPage from './pages/PongShowdownPage'
import ScrollToTop from './components/ScrollToTop'

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <ScrollToTop />
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bank-holiday-planner" element={<BankHolidayPlannerPage />} />
            <Route path="/second-hand-food-market" element={<SecondHandFoodMarketPage />} />
            <Route path="/game-of-life-lab" element={<GameOfLifeLabPage />} />
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
      </HashRouter>
    </ThemeProvider>
  )
}
