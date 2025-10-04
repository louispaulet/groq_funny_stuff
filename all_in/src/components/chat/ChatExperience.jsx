import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../Sidebar'
import MessageList from './MessageList'
import Composer from './Composer'
import ModelSelector from '../ModelSelector'
import { callRemoteChat } from '../../lib/remoteChat'
import BarcodeScannerModal from '../common/BarcodeScannerModal'
import {
  readAllergyCookie,
  readSavedConversations,
  writeSavedConversations,
  ensureChatCountAtLeast,
  incrementChatCount,
  MAX_SAVED_CONVERSATIONS,
} from '../../lib/allergyCookies'
import { enhanceAssistantContent } from '../../lib/assistantPostprocess'

function normalizeBaseUrl(raw) {
  const candidate = (raw || '').trim()
  if (!candidate) {
    throw new Error('Endpoint is required.')
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

const PERSISTENT_EXPERIENCE_IDS = new Set(['allergyfinder', 'stlviewer', 'pokedex'])

function hydrateSavedConversations(saved, experience, assistantName) {
  if (!Array.isArray(saved) || saved.length === 0) return []
  return saved
    .map((conversation, index) => {
      const id = typeof conversation?.id === 'string' ? conversation.id : makeId()
      const title = typeof conversation?.title === 'string' && conversation.title.trim()
        ? conversation.title.trim()
        : `Saved chat ${index + 1}`
      const rawMessages = Array.isArray(conversation?.messages) ? conversation.messages : []
      const messages = rawMessages.length > 0
        ? rawMessages.map((message) => {
            const role = message?.role === 'assistant' ? 'assistant' : 'user'
            const content = typeof message?.content === 'string' ? message.content : ''
            return {
              role,
              content,
              name: role === 'assistant' ? assistantName : 'You',
              timestamp:
                typeof message?.timestamp === 'number' && Number.isFinite(message.timestamp)
                  ? message.timestamp
                  : Date.now(),
              streaming: false,
              error: Boolean(message?.error),
              sources: Array.isArray(message?.sources) ? message.sources : undefined,
            }
          })
        : [makeGreeting(experience, assistantName)]
      return {
        id,
        title,
        messages,
      }
    })
    .filter((conversation) => Array.isArray(conversation.messages) && conversation.messages.length > 0)
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
  const [scannerOpen, setScannerOpen] = useState(false)
  const abortRef = useRef(null)
  const skipPersistRef = useRef(false)

  const persistConversations = experience?.id && PERSISTENT_EXPERIENCE_IDS.has(experience.id)
  const enableBarcodeScanner = Boolean(experience?.enableBarcodeScanner)

  useEffect(() => {
    let loadedConversations = []
    let usedSavedHistory = false

    if (persistConversations) {
      const saved = readSavedConversations(experience.id)
      const hydrated = hydrateSavedConversations(saved, experience, assistantName)
      if (hydrated.length > 0) {
        loadedConversations = hydrated
        usedSavedHistory = true
        ensureChatCountAtLeast(experience?.id, hydrated.length)
      }
    }

    if (loadedConversations.length === 0) {
      const fresh = createConversation(experience, assistantName)
      loadedConversations = [fresh]
      if (persistConversations) {
        writeSavedConversations(experience.id, loadedConversations)
      }
    }

    setConversations(loadedConversations)
    setActiveId(loadedConversations[0]?.id)
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
    skipPersistRef.current = usedSavedHistory
  }, [experience, assistantName, persistConversations])

  const current = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) || conversations[0],
    [conversations, activeId],
  )
  const messages = current?.messages || []
  const placeholder = experience?.promptPlaceholder || 'Ask anything...'

  useEffect(() => {
    if (!persistConversations) return
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    writeSavedConversations(experience.id, conversations)
  }, [conversations, experience?.id, persistConversations])

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
    setConversations((prev) => {
      const next = [fresh, ...prev]
      return persistConversations ? next.slice(0, MAX_SAVED_CONVERSATIONS) : next
    })
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

  function handleFlushHistory() {
    if (loading) return
    const fresh = createConversation(experience, assistantName)
    setConversations([fresh])
    setActiveId(fresh.id)
    setPrompt('')
    if (persistConversations) {
      writeSavedConversations(experience.id, [fresh])
      skipPersistRef.current = true
    }
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

  function handleBarcodeDetected(code) {
    if (!enableBarcodeScanner) return
    const normalized = `${code}`.trim()
    if (!normalized) return
    setScannerOpen(false)
    setPrompt(normalized)
    handleSend(normalized)
  }

  async function handleSend(inputText) {
    const trimmed = (typeof inputText === 'string' ? inputText : prompt).trim()
    if (!trimmed || loading) return

    const timestamp = Date.now()
    const userMessage = { role: 'user', name: 'You', timestamp, content: trimmed }
    const shouldIncrementCount = Boolean(experience?.id) && !messages.some((message) => message.role === 'user')

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
      if (shouldIncrementCount) {
        incrementChatCount(experience.id)
      }
      const history = [...messages, userMessage]
      let systemPrompt = experience?.systemPrompt
      if (experience?.id === 'allergyfinder') {
        const cookieNotes = readAllergyCookie()
        if (cookieNotes) {
          systemPrompt = [
            systemPrompt,
            'User allergy notes saved via the Allergy Cookie Editor (markdown format):',
            cookieNotes,
          ]
            .filter(Boolean)
            .join('\n\n')
        }
      }
      const chatMessages = buildMessages(systemPrompt, history)
      const result = await callRemoteChat(experience, chatMessages, {
        signal: controller.signal,
        model,
        baseUrl: resolvedBase,
      })
      setBaseUrl(result.baseUrl)
      const enhancedContent = enhanceAssistantContent(experience, result.content)
      setConversations((prev) => prev.map((conversation) => {
        if (conversation.id !== activeId) return conversation
        const nextMessages = [...conversation.messages]
        const lastIndex = nextMessages.length - 1
        if (lastIndex >= 0 && nextMessages[lastIndex].role === 'assistant') {
          nextMessages[lastIndex] = {
            ...nextMessages[lastIndex],
            content: enhancedContent,
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

  const endpointDisplay = baseUrl || experience?.defaultBaseUrl || ''

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <aside className="md:col-span-4 lg:col-span-3">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNewConversation}
          onRename={handleRename}
          onFlushHistory={persistConversations ? handleFlushHistory : undefined}
          disableNew={loading}
          disableFlush={loading}
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
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Assistant</span>: {assistantName}
            </div>
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Endpoint</span>: {endpointDisplay || 'Not configured'}
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
          onOpenScanner={enableBarcodeScanner ? () => setScannerOpen(true) : undefined}
        />
      </section>
      {enableBarcodeScanner && (
        <BarcodeScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onDetected={handleBarcodeDetected}
        />
      )}
    </div>
  )
}
