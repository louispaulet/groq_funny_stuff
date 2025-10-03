import { Fragment } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ExperiencePage from './pages/ExperiencePage'
import AboutPage from './pages/AboutPage'
import ChatExperience from './components/chat/ChatExperience'
import { ThemeProvider } from './theme/ThemeContext'
import { experiences } from './config/experiences'
import AllergyCookieEditor from './components/allergyfinder/AllergyCookieEditor'
import AllergyFinderNav from './components/allergyfinder/AllergyFinderNav'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
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
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
