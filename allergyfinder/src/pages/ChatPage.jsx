import { useRef, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MessageList from '../components/chat/MessageList'
import Composer from '../components/chat/Composer'
import { callRemoteChat } from '../lib/remoteChat'

const DEFAULT_MODEL = 'openai/gpt-oss-20b'
const GREETING = "Hi! Ask me about allergens in any food and I'll use OpenFoodFacts to help."
const SYSTEM_PROMPT = [
  'You are an allergy assistant that uses OpenFoodFacts data to answer questions about food allergens.',
  'Use the provided context when it is relevant and be transparent about any gaps.',
  'Encourage users to double-check packaging for medical decisions.',
].join(' ')

function toChatMessages(messages) {
  const history = (messages || [])
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: m.content }))
  return [{ role: 'system', content: SYSTEM_PROMPT }, ...history]
}

export default function ChatPage() {
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [conversations, setConversations] = useState([
    {
      id: 'conv-1',
      title: 'New Chat',
      messages: [
        { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING },
      ],
    },
  ])
  const [activeId, setActiveId] = useState('conv-1')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)

  const current = conversations.find((c) => c.id === activeId)
  const messages = current?.messages || []

  async function handleSend() {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    const timestamp = Date.now()
    const userMsg = { role: 'user', name: 'You', timestamp, content: trimmed }
    const history = [...messages, userMsg]

    // Eagerly update UI with user + placeholder assistant message
    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id !== activeId) return conversation
      const title = conversation.title === 'New Chat' ? trimmed.slice(0, 30) : conversation.title
      return {
        ...conversation,
        title,
        messages: [
          ...conversation.messages,
          userMsg,
          {
            role: 'assistant',
            name: 'Groq',
            timestamp: Date.now(),
            content: '',
            streaming: true,
          },
        ],
      }
    }))

    setPrompt('')
    setLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const chatMessages = toChatMessages([...history])
      const result = await callRemoteChat(chatMessages, {
        signal: controller.signal,
        model,
      })

      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const msgs = [...conversation.messages]
        const lastIndex = msgs.length - 1
        if (lastIndex >= 0 && msgs[lastIndex].role === 'assistant') {
          msgs[lastIndex] = {
            ...msgs[lastIndex],
            content: result.content,
            streaming: false,
            sources: [],
          }
        }
        return { ...conversation, messages: msgs }
      }))
    } catch (error) {
      const aborted = error?.name === 'AbortError'
      const message = aborted ? 'Request cancelled.' : 'Unable to reach the allergy service. Please try again.'
      if (!aborted) {
        console.error('AllergyFinder chat error', error)
      }
      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const msgs = [...conversation.messages]
        const lastIndex = msgs.length - 1
        if (lastIndex >= 0 && msgs[lastIndex].role === 'assistant') {
          msgs[lastIndex] = {
            ...msgs[lastIndex],
            content: message,
            streaming: false,
            error: true,
          }
        }
        return { ...conversation, messages: msgs }
      }))
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }

  function handleStop() {
    if (!loading) return
    try {
      abortRef.current?.abort()
    } catch {}
    abortRef.current = null
    setLoading(false)
    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id !== activeId) return conversation
      const msgs = [...conversation.messages]
      const lastIndex = msgs.length - 1
      if (lastIndex >= 0 && msgs[lastIndex].role === 'assistant') {
        msgs[lastIndex] = {
          ...msgs[lastIndex],
          content: 'Request cancelled.',
          streaming: false,
          error: true,
        }
      }
      return { ...conversation, messages: msgs }
    }))
  }

  function handleClear() {
    if (loading) return
    setConversations((prev) => prev.map((conversation) => (
      conversation.id === activeId
        ? {
            ...conversation,
            title: 'New Chat',
            messages: [
              { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING },
            ],
          }
        : conversation
    )))
  }

  function handleNewConversation() {
    if (loading) return
    const id = `conv-${Date.now()}`
    setConversations((prev) => [
      {
        id,
        title: 'New Chat',
        messages: [
          { role: 'assistant', name: 'Groq', timestamp: Date.now(), content: GREETING },
        ],
      },
      ...prev,
    ])
    setActiveId(id)
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
              onNew={handleNewConversation}
              onRename={(id, title) => setConversations((prev) => prev.map((conversation) => (
                conversation.id === id ? { ...conversation, title } : conversation
              )))}
            />
          </aside>
          <main className="col-span-12 md:col-span-9 lg:col-span-9 flex flex-col gap-4">
            <MessageList messages={messages} />
            <Composer
              value={prompt}
              onChange={setPrompt}
              onSend={handleSend}
              onStop={handleStop}
              loading={loading}
              onClear={handleClear}
            />
          </main>
        </div>
      </div>
    </div>
  )
}
