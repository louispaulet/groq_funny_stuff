const PERSISTENT_EXPERIENCE_IDS = new Set(['allergyfinder', 'stlviewer', 'pokedex'])

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

export {
  PERSISTENT_EXPERIENCE_IDS,
  buildMessages,
  createConversation,
  hydrateSavedConversations,
  makeGreeting,
  normalizeBaseUrl,
}
