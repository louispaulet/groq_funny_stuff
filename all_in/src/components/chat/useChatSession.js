import { useEffect, useMemo, useRef, useState } from 'react'
import { callRemoteChat } from '../../lib/remoteChat'
import {
  readAllergyCookie,
  readSavedConversations,
  writeSavedConversations,
  ensureChatCountAtLeast,
  incrementChatCount,
  MAX_SAVED_CONVERSATIONS,
} from '../../lib/allergyCookies'
import { enhanceAssistantContent } from '../../lib/assistantPostprocess'
import {
  PERSISTENT_EXPERIENCE_IDS,
  buildMessages,
  createConversation,
  hydrateSavedConversations,
  makeGreeting,
  normalizeBaseUrl,
} from './chatHelpers'

export function useChatSession(experience) {
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
  const skipPersistRef = useRef(false)

  const persistConversations = Boolean(experience?.id) && PERSISTENT_EXPERIENCE_IDS.has(experience.id)
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

  return {
    activeId,
    assistantName,
    baseUrl,
    conversations,
    enableBarcodeScanner,
    endpointDisplay,
    handleClear,
    handleFlushHistory,
    handleNewConversation,
    handleRename,
    handleSend,
    handleStop,
    loading,
    messages,
    model,
    persistConversations,
    placeholder,
    prompt,
    setActiveId,
    setModel,
    setPrompt,
  }
}
