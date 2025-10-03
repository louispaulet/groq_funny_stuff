import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../Sidebar'
import MessageList from './MessageList'
import Composer from './Composer'
import ModelSelector from '../ModelSelector'
import { callRemoteChat } from '../../lib/remoteChat'

function normalizeBaseUrl(raw) {
  const candidate = (raw || '').trim()
  if (!candidate) {
    throw new Error('Service base URL is required.')
  }
  return candidate.replace(/\/$/, '')
}

function buildMessages(systemPrompt, history) {
  const base = systemPrompt ? [{ role: 'system', content: systemPrompt }] : []
  const turns = (history || [])
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .map((item) => ({ role: item.role, content: item.content }))
  return [...base, ...turns]
}

function makeId() {
  return `conv-${Math.random().toString(16).slice(2, 6)}-${Date.now()}`
}

function makeGreeting(experience, assistantName) {
  return {
    role: 'assistant',
    name: assistantName,
    timestamp: Date.now(),
    content: experience?.greeting || `Hello from ${assistantName}`,
  }
}

function createConversation(experience, assistantName) {
  return {
    id: makeId(),
    title: 'New chat',
    messages: [makeGreeting(experience, assistantName)],
  }
}

export default function ChatExperience({ experience }) {
  const assistantName = experience?.name || 'Groq Assistant'
  const initialModel = experience?.defaultModel || experience?.modelOptions?.[0] || 'openai/gpt-oss-20b'
  const initialBaseUrl = useMemo(() => {
    const base = experience?.defaultBaseUrl || ''
    return base ? base.replace(/\/$/, '') : ''
  }, [experience])

  const [model, setModel] = useState(initialModel)
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl)
  const [conversations, setConversations] = useState(() => {
    const seed = createConversation(experience, assistantName)
    return [seed]
  })
  const [activeId, setActiveId] = useState(() => conversations[0]?.id)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)

  useEffect(() => {
    const fresh = createConversation(experience, assistantName)
    setConversations([fresh])
    setActiveId(fresh.id)
    setPrompt('')
    setModel(experience?.defaultModel || experience?.modelOptions?.[0] || 'openai/gpt-oss-20b')
    setBaseUrl((experience?.defaultBaseUrl || '').replace(/\/$/, ''))
    if (abortRef.current) {
      try {
        abortRef.current.abort()
      } catch {
        // ignore abort failures
      }
      abortRef.current = null
    }
    setLoading(false)
  }, [experience, assistantName])

  const current = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || conversations[0],
    [conversations, activeId],
  )
  const messages = current?.messages || []
  const placeholder = experience?.promptPlaceholder || 'Ask anything...'

  function handleRename(id, title) {
    setConversations((prev) => prev.map((conversation) => (
      conversation.id === id
        ? { ...conversation, title: title?.trim() ? title.trim() : conversation.title }
        : conversation
    )))
  }

  function handleNewConversation() {
    if (loading) return
    const fresh = createConversation(experience, assistantName)
    setConversations((prev) => [fresh, ...prev])
    setActiveId(fresh.id)
    setPrompt('')
  }

  function handleClear() {
    if (loading) return
    const greeting = makeGreeting(experience, assistantName)
    setConversations((prev) => prev.map((conversation) => (
      conversation.id === activeId
        ? { ...conversation, title: 'New chat', messages: [greeting] }
        : conversation
    )))
  }

  function handleStop() {
    if (!loading) return
    try {
      abortRef.current?.abort()
    } catch {
      // ignore
    }
    abortRef.current = null
    setLoading(false)
    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id !== activeId) return conversation
      const nextMessages = [...conversation.messages]
      const lastIndex = nextMessages.length - 1
      if (lastIndex >= 0 && nextMessages[lastIndex].role === 'assistant') {
        nextMessages[lastIndex] = {
          ...nextMessages[lastIndex],
          content: 'Request cancelled.',
          streaming: false,
          error: true,
        }
      }
      return { ...conversation, messages: nextMessages }
    }))
  }

  async function handleSend() {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    const timestamp = Date.now()
    const userMessage = { role: 'user', name: 'You', timestamp, content: trimmed }

    let resolvedBase
    try {
      const target = experience?.allowBaseUrlOverride ? baseUrl : (experience?.defaultBaseUrl || baseUrl)
      resolvedBase = normalizeBaseUrl(target)
    } catch (configError) {
      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const title = conversation.title === 'New chat' ? trimmed.slice(0, 30) || conversation.title : conversation.title
        return {
          ...conversation,
          title,
          messages: [
            ...conversation.messages,
            userMessage,
            {
              role: 'assistant',
              name: assistantName,
              timestamp: Date.now(),
              content: `Warning: ${configError.message}`,
              error: true,
            },
          ],
        }
      }))
      setPrompt('')
      return
    }

    setConversations((prev) => prev.map((conversation) => {
      if (conversation.id !== activeId) return conversation
      const title = conversation.title === 'New chat' ? trimmed.slice(0, 30) || conversation.title : conversation.title
      return {
        ...conversation,
        title,
        messages: [
          ...conversation.messages,
          userMessage,
          {
            role: 'assistant',
            name: assistantName,
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
      const history = [...messages, userMessage]
      const chatMessages = buildMessages(experience?.systemPrompt, history)
      const result = await callRemoteChat(experience, chatMessages, {
        signal: controller.signal,
        model,
        baseUrl: resolvedBase,
      })
      setBaseUrl(result.baseUrl)
      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const nextMessages = [...conversation.messages]
        const lastIndex = nextMessages.length - 1
        if (lastIndex >= 0 && nextMessages[lastIndex].role === 'assistant') {
          nextMessages[lastIndex] = {
            ...nextMessages[lastIndex],
            content: result.content,
            streaming: false,
            error: false,
          }
        }
        return { ...conversation, messages: nextMessages }
      }))
    } catch (error) {
      const aborted = error?.name === 'AbortError'
      const message = aborted
        ? 'Request cancelled.'
        : `Unable to reach the service. ${error?.message || 'Please try again.'}`
      if (!aborted) {
        // eslint-disable-next-line no-console
        console.error(`[${experience?.logLabel || 'Chat'}] request failed`, error)
      }
      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const nextMessages = [...conversation.messages]
        const lastIndex = nextMessages.length - 1
        if (lastIndex >= 0 && nextMessages[lastIndex].role === 'assistant') {
          nextMessages[lastIndex] = {
            ...nextMessages[lastIndex],
            content: message,
            streaming: false,
            error: true,
          }
        }
        return { ...conversation, messages: nextMessages }
      }))
    } finally {
      abortRef.current = null
      setLoading(false)
    }
  }

  const baseUrlReadonly = experience?.allowBaseUrlOverride ? null : (baseUrl || experience?.defaultBaseUrl || '')

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <aside className="md:col-span-4 lg:col-span-3">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNewConversation}
          onRename={handleRename}
        />
      </aside>
      <section className="md:col-span-8 lg:col-span-9 flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Session settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a model and endpoint for this workspace.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <ModelSelector value={model} onChange={setModel} options={experience?.modelOptions || []} />
              {experience?.allowBaseUrlOverride ? (
                <label className="block text-sm">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Service base URL</span>
                  <input
                    type="url"
                    value={baseUrl}
                    onChange={(event) => setBaseUrl(event.target.value)}
                    onBlur={(event) => {
                      try {
                        setBaseUrl(normalizeBaseUrl(event.target.value))
                      } catch {
                        // keep raw input; validation happens on send
                      }
                    }}
                    className="mt-1 block w-64 rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="https://your-endpoint.example"
                    disabled={loading}
                  />
                </label>
              ) : (
                <div className="min-w-[16rem] rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <div className="uppercase tracking-wide text-[10px] text-slate-500 dark:text-slate-400">Service base URL</div>
                  <code className="break-all text-[12px]">{baseUrlReadonly || 'Not configured'}</code>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Assistant</span>: {assistantName}
            </div>
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Endpoint</span>: {baseUrlReadonly || baseUrl || 'Not configured'}
            </div>
          </div>
        </div>

        <MessageList experience={experience} messages={messages} />

        <Composer
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          onClear={handleClear}
          loading={loading}
          placeholder={placeholder}
        />
      </section>
    </div>
  )
}
