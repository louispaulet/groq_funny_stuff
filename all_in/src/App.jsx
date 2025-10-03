import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import ExperiencePage from './pages/ExperiencePage'
import AboutPage from './pages/AboutPage'
import ChatExperience from './components/chat/ChatExperience'
import { ThemeProvider } from './theme/ThemeContext'
import { experiences } from './config/experiences'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {experiences.map((experience) => (
              <Route
                key={experience.id}
                path={experience.path}
                element={(
                  <ExperiencePage experience={experience}>
                    <ChatExperience experience={experience} />
                  </ExperiencePage>
                )}
              />
            ))}
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  )
}
