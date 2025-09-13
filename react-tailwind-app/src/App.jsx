import ChatPage from './pages/ChatPage'
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <ChatPage />
    </ThemeProvider>
  )
}

export default App
