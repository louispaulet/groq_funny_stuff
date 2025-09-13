import ChatPage from './pages/ChatPage'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Groq JS + React
          </h1>
          <p className="mt-3 text-slate-600">
            Send a prompt and render Markdown as HTML.
          </p>
        </header>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <ChatPage />
        </div>
      </div>
    </div>
  )
}

export default App
