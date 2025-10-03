const ALLERGY_COOKIE_NAME = 'allergy_notes'
const ALLERGY_CONVERSATIONS_COOKIE_NAME = 'allergyfinder_conversations'
const USER_PROFILE_COOKIE_NAME = 'allin_profile_name'
const CHAT_COUNT_COOKIE_NAME = 'allin_chat_counts'
const ALLERGY_EXPERIENCE_ID = 'allergyfinder'

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365
const MAX_SAVED_CONVERSATIONS = 2
const MAX_SAVED_MESSAGES = 6
const MAX_MESSAGE_LENGTH = 220
const COOKIE_MAX_SIZE = 3500

function getDocument() {
  return typeof document === 'undefined' ? null : document
}

function readCookieValue(name) {
  const doc = getDocument()
  if (!doc || !doc.cookie) return ''
  const cookies = doc.cookie.split('; ')
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  if (!target) return ''
  return target.split('=').slice(1).join('=')
}

function writeCookie(name, value, maxAgeSeconds = YEAR_IN_SECONDS) {
  const doc = getDocument()
  if (!doc) return
  const encoded = encodeURIComponent(value)
  const attributes = [`path=/`, `max-age=${maxAgeSeconds}`]
  doc.cookie = `${name}=${encoded}; ${attributes.join('; ')}`
}

function deleteCookie(name) {
  const doc = getDocument()
  if (!doc) return
  doc.cookie = `${name}=; path=/; max-age=0`
}

export function readAllergyCookie() {
  try {
    return decodeURIComponent(readCookieValue(ALLERGY_COOKIE_NAME))
  } catch {
    return ''
  }
}

export function writeAllergyCookie(value, maxAgeSeconds = YEAR_IN_SECONDS) {
  writeCookie(ALLERGY_COOKIE_NAME, value, maxAgeSeconds)
}

export function countAllergyEntries() {
  const notes = readAllergyCookie()
  if (!notes) return 0
  return notes
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*+\s]+/, '').trim())
    .filter((line) => line.length > 0).length
}

function sanitizeMessageForStorage(message) {
  const role = message?.role === 'assistant' ? 'assistant' : 'user'
  const rawContent = typeof message?.content === 'string' ? message.content : ''
  const content = rawContent.slice(0, MAX_MESSAGE_LENGTH)
  if (!content) return null
  const timestamp = typeof message?.timestamp === 'number' && Number.isFinite(message.timestamp)
    ? Math.round(message.timestamp)
    : Date.now()
  const record = { role, content, timestamp }
  if (message?.sources && Array.isArray(message.sources) && message.sources.length > 0) {
    record.sources = message.sources.slice(0, 2)
  }
  if (message?.error) {
    record.error = true
  }
  return record
}

function sanitizeConversationForStorage(conversation) {
  if (!conversation) return null
  const rawMessages = Array.isArray(conversation.messages) ? conversation.messages : []
  const messages = rawMessages
    .slice(-MAX_SAVED_MESSAGES)
    .map(sanitizeMessageForStorage)
    .filter(Boolean)
  if (messages.length === 0) return null
  const title = typeof conversation.title === 'string' && conversation.title.trim()
    ? conversation.title.trim().slice(0, 60)
    : 'Saved chat'
  const record = {
    id: typeof conversation.id === 'string' ? conversation.id : undefined,
    title,
    messages,
  }
  if (conversation?.createdAt) {
    record.createdAt = conversation.createdAt
  }
  return record
}

function buildConversationPayload(conversations) {
  const rawList = Array.isArray(conversations) ? conversations : []
  return rawList
    .filter(Boolean)
    .slice(0, MAX_SAVED_CONVERSATIONS)
    .map(sanitizeConversationForStorage)
    .filter(Boolean)
}

export function readAllergyConversationsCookie() {
  const raw = readCookieValue(ALLERGY_CONVERSATIONS_COOKIE_NAME)
  if (!raw) return []
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    return buildConversationPayload(parsed)
  } catch {
    return []
  }
}

export function writeAllergyConversationsCookie(conversations) {
  const payload = buildConversationPayload(conversations)
  if (payload.length === 0) {
    deleteCookie(ALLERGY_CONVERSATIONS_COOKIE_NAME)
    clearChatCount(ALLERGY_EXPERIENCE_ID)
    return
  }
  let serialized = JSON.stringify(payload)
  if (serialized.length > COOKIE_MAX_SIZE) {
    const trimmed = payload.slice(0, 1)
    serialized = JSON.stringify(trimmed)
    if (serialized.length > COOKIE_MAX_SIZE) {
      deleteCookie(ALLERGY_CONVERSATIONS_COOKIE_NAME)
      return
    }
  }
  writeCookie(ALLERGY_CONVERSATIONS_COOKIE_NAME, serialized)
  ensureChatCountAtLeast(ALLERGY_EXPERIENCE_ID, payload.length)
}

export function clearAllergyConversationsCookie() {
  deleteCookie(ALLERGY_CONVERSATIONS_COOKIE_NAME)
  clearChatCount(ALLERGY_EXPERIENCE_ID)
}

function readChatCountMap() {
  const raw = readCookieValue(CHAT_COUNT_COOKIE_NAME)
  if (!raw) return {}
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // ignore parse errors
  }
  return {}
}

function writeChatCountMap(map) {
  if (!map || Object.keys(map).length === 0) {
    deleteCookie(CHAT_COUNT_COOKIE_NAME)
    return
  }
  try {
    const serialized = JSON.stringify(map)
    if (serialized.length > COOKIE_MAX_SIZE) {
      deleteCookie(CHAT_COUNT_COOKIE_NAME)
      return
    }
    writeCookie(CHAT_COUNT_COOKIE_NAME, serialized)
  } catch {
    deleteCookie(CHAT_COUNT_COOKIE_NAME)
  }
}

export function readChatCounts() {
  const map = readChatCountMap()
  let allergyCount = Number.parseInt(map.allergyfinder, 10) || 0
  if (allergyCount === 0) {
    const saved = readAllergyConversationsCookie()
    if (saved.length > allergyCount) {
      allergyCount = saved.length
    }
  }
  return {
    allergyfinder: allergyCount,
    stlviewer: Number.parseInt(map.stlviewer, 10) || 0,
    pokedex: Number.parseInt(map.pokedex, 10) || 0,
  }
}

export function incrementChatCount(experienceId) {
  if (!experienceId) return
  const map = readChatCountMap()
  map[experienceId] = (Number.parseInt(map[experienceId], 10) || 0) + 1
  writeChatCountMap(map)
}

export function ensureChatCountAtLeast(experienceId, minimum) {
  if (!experienceId) return
  const target = Math.max(0, Number(minimum) || 0)
  const map = readChatCountMap()
  const current = Number.parseInt(map[experienceId], 10) || 0
  if (target === 0 && current === 0) return
  if (target <= current) return
  map[experienceId] = target
  writeChatCountMap(map)
}

export function clearChatCount(experienceId) {
  const map = readChatCountMap()
  if (!experienceId || !(experienceId in map)) {
    return
  }
  delete map[experienceId]
  writeChatCountMap(map)
}

export function clearAllChatCounts() {
  deleteCookie(CHAT_COUNT_COOKIE_NAME)
}

export function readUserProfileName() {
  const raw = readCookieValue(USER_PROFILE_COOKIE_NAME)
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return ''
  }
}

export function writeUserProfileName(name, maxAgeSeconds = YEAR_IN_SECONDS) {
  if (!name) {
    deleteCookie(USER_PROFILE_COOKIE_NAME)
    return
  }
  writeCookie(USER_PROFILE_COOKIE_NAME, name, maxAgeSeconds)
}

export function clearUserProfileName() {
  deleteCookie(USER_PROFILE_COOKIE_NAME)
}

export function flushAllCookies() {
  const doc = getDocument()
  if (!doc || !doc.cookie) return
  doc.cookie.split(';').forEach((cookie) => {
    const eqIndex = cookie.indexOf('=')
    const name = eqIndex > -1 ? cookie.slice(0, eqIndex).trim() : cookie.trim()
    if (!name) return
    doc.cookie = `${name}=; path=/; max-age=0`
  })
}

export {
  ALLERGY_COOKIE_NAME,
  ALLERGY_CONVERSATIONS_COOKIE_NAME,
  USER_PROFILE_COOKIE_NAME,
  CHAT_COUNT_COOKIE_NAME,
}
