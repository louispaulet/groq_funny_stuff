import { useState } from 'react'
import { useGroqClient } from '../hooks/useGroqClient'
import { useChatStream } from '../hooks/useChatStream'
import { buildPromptFromMessages } from '../lib/chat'
import Header from '../components/Header'
import MessageList from '../components/chat/MessageList'
import Composer from '../components/chat/Composer'

const DEFAULT_MODEL = 'openai/gpt-oss-20b'

export default function ChatPage() {
  const client = useGroqClient()
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything.' },
  ])
  const [prompt, setPrompt] = useState('')

  const { loading, start, stop } = useChatStream({
    client,
    model,
    onDelta: (piece) => {
      setMessages((prev) => {
        const next = [...prev]
        const i = next.length - 1
        if (i >= 0 && next[i].role === 'assistant') {
          next[i] = { ...next[i], content: next[i].content + piece }
        }
        return next
      })
    },
    onComplete: (text) => {
      setMessages((prev) => {
        const next = [...prev]
        const i = next.length - 1
        if (i >= 0 && next[i].role === 'assistant') {
          next[i] = { ...next[i], content: text }
        }
        return next
      })
    },
    onError: (err) => {
      console.error(err)
    },
  })

  async function handleSend() {
    if (!prompt.trim() || loading) return
    const userMsg = { role: 'user', content: prompt.trim() }
    const history = [...messages, userMsg]
    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }])
    setPrompt('')
    await start(buildPromptFromMessages(history))
  }

  function handleClear() {
    if (loading) return
    setMessages([{ role: 'assistant', content: 'Hi! Ask me anything.' }])
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header model={model} onModelChange={setModel} />
      <main className="mx-auto w-full max-w-6xl grow px-4 py-6 space-y-4">
        <MessageList messages={messages} />
        <Composer
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={stop}
          loading={loading}
          onClear={handleClear}
        />
      </main>
    </div>
  )
}
