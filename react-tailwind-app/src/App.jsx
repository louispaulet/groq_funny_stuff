import { Suspense, lazy } from 'react'
const ChatPage = lazy(() => import('./pages/ChatPage'))
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<div className="p-6 text-slate-500">Loading…</div>}>
        <ChatPage />
      </Suspense>
    </ThemeProvider>
  )
}

export default App
