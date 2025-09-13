import { useState } from 'react'
import { useGroqClient } from '../hooks/useGroqClient'
import { useChatStream } from '../hooks/useChatStream'
import { buildPromptFromMessages } from '../lib/chat'
import ModelSelector from '../components/ModelSelector'
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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ModelSelector value={model} onChange={setModel} />
      </div>
      <MessageList messages={messages} />
      <Composer
        value={prompt}
        onChange={setPrompt}
        onSend={handleSend}
        onStop={stop}
        loading={loading}
        onClear={handleClear}
      />
    </div>
  )
}

