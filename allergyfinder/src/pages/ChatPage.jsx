import { useRef, useState } from 'react'
import { useGroqClient } from '../hooks/useGroqClient'
import { useChatStream } from '../hooks/useChatStream'
import { buildPromptFromMessages } from '../lib/chat'
import { fetchAllergenContext } from '../lib/openFoodFacts'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MessageList from '../components/chat/MessageList'
import Composer from '../components/chat/Composer'

const DEFAULT_MODEL = 'openai/gpt-oss-20b'
const GREETING = 'Hi! Ask me about allergens in any food and I\'ll use OpenFoodFacts to help.'

export default function ChatPage() {
  const client = useGroqClient()
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [conversations, setConversations] = useState([
    { id: 'conv-1', title: 'New Chat', messages: [
      { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING },
    ]}
  ])
  const [activeId, setActiveId] = useState('conv-1')
  const current = conversations.find((c) => c.id === activeId)
  const messages = current?.messages || []
  const [prompt, setPrompt] = useState('')
  const allergenCacheRef = useRef(new Map())

  const { loading, start, stop } = useChatStream({
    client,
    model,
    onDelta: (piece) => {
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c
        const msgs = [...c.messages]
        const i = msgs.length - 1
        if (i >= 0 && msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content: msgs[i].content + piece, streaming: true }
        }
        return { ...c, messages: msgs }
      }))
    },
    onComplete: (text) => {
      setConversations((prev) => prev.map((c) => {
        if (c.id !== activeId) return c
        const msgs = [...c.messages]
        const i = msgs.length - 1
        if (i >= 0 && msgs[i].role === 'assistant') {
          msgs[i] = { ...msgs[i], content: text, streaming: false }
        }
        return { ...c, messages: msgs }
      }))
    },
    onError: (err) => {
      console.error(err)
    },
  })

  async function resolveAllergenContext(text) {
    const key = text.trim().toLowerCase()
    if (!key) return ''
    const cache = allergenCacheRef.current
    if (cache.has(key)) {
      return cache.get(key) || ''
    }
    const context = await fetchAllergenContext(text)
    cache.set(key, context)
    return context || ''
  }

  async function handleSend() {
    if (!prompt.trim() || loading) return
    const userMsg = { role: 'user', name: 'You', timestamp: Date.now(), content: prompt.trim() }
    const history = [...messages, userMsg]
    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeId) return c
      const msgs = [...c.messages, userMsg, { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: '', streaming: true }]
      const title = c.title === 'New Chat' ? userMsg.content.slice(0, 30) : c.title
      return { ...c, messages: msgs, title }
    }))
    setPrompt('')
    const context = await resolveAllergenContext(userMsg.content)
    await start(buildPromptFromMessages(history, context))
    // Ensure streaming flag flips off even if 'completed' did not fire
    setConversations((prev) => prev.map((c) => {
      if (c.id !== activeId) return c
      const msgs = [...c.messages]
      const i = msgs.length - 1
      if (i >= 0 && msgs[i].role === 'assistant' && msgs[i].streaming) {
        msgs[i] = { ...msgs[i], streaming: false }
      }
      return { ...c, messages: msgs }
    }))
  }

  function handleClear() {
    if (loading) return
    setConversations((prev) => prev.map((c) => c.id === activeId
      ? { ...c, messages: [{ role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING }], title: 'New Chat' }
      : c
    ))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header model={model} onModelChange={setModel} />
      <div className="mx-auto w-full max-w-6xl grow px-4 py-6">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3 lg:col-span-3">
            <Sidebar
              conversations={conversations}
              activeId={activeId}
              onSelect={setActiveId}
              onNew={() => {
                const id = `conv-${Date.now()}`
                setConversations((prev) => [
                  { id, title: 'New Chat', messages: [ { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING } ] },
                  ...prev,
                ])
                setActiveId(id)
              }}
              onRename={(id, title) => setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c))}
            />
          </aside>
          <main className="col-span-12 md:col-span-9 lg:col-span-9 flex flex-col gap-4">
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
      </div>
    </div>
  )
}
