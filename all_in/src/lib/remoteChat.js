const importMetaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined
const processEnv = typeof globalThis !== 'undefined' && globalThis.process?.env ? globalThis.process.env : undefined

function getEnvValue(key) {
  if (!key) return undefined
  if (importMetaEnv && importMetaEnv[key] !== undefined) return importMetaEnv[key]
  if (processEnv && processEnv[key] !== undefined) return processEnv[key]
  return undefined
}

const FALLBACK_BASE_URL = (getEnvValue('VITE_CHAT_BASE_URL') || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

function preview(text = '', length = 180) {
  if (!text) return ''
  const trimmed = String(text).trim()
  if (trimmed.length <= length) return trimmed
  return `${trimmed.slice(0, length)}...`
}

export async function callRemoteChat(experience, messages, { signal, model, baseUrl } = {}) {
  const label = experience?.logLabel || 'Chat'
  const base = (baseUrl || experience?.defaultBaseUrl || FALLBACK_BASE_URL || '').replace(/\/$/, '')
  if (!base) {
    throw new Error('Missing chat service base URL. Set VITE_CHAT_BASE_URL or provide an override.')
  }
  const url = `${base}/chat`
  const timerStart = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
  const lastMessage = messages?.[messages.length - 1]
  const lastContent = lastMessage?.content || ''
  // eslint-disable-next-line no-console
  console.log(
    `[${label}] → POST %s — model: %s — prompt: %s`,
    url,
    model || 'default',
    preview(lastContent, 160),
  )

  const body = model ? { model, messages } : { messages }
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })
  } catch (error) {
    throw new Error(`Request to ${label} service failed: ${error?.message || error}`)
  }

  const timerEnd = typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now()
  const duration = Math.round(timerEnd - timerStart)

  let rawBody = ''
  let payload

  if (typeof response.text === 'function') {
    rawBody = await response.text()
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = undefined
    }
  } else if (typeof response.json === 'function') {
    payload = await response.json()
    try {
      rawBody = JSON.stringify(payload)
    } catch {
      rawBody = '[object Object]'
    }
  }

  if (!response.ok) {
    const statusText = response.statusText || 'Unknown error'
    const message = preview(rawBody || statusText, 200)
    throw new Error(`Remote chat service returned ${response.status}: ${message}`)
  }

  if (!payload) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      throw new Error('Remote chat service returned invalid JSON')
    }
  }

  let content = payload?.choices?.[0]?.message?.content
  if (!content && typeof payload?.output_text === 'string') {
    content = payload.output_text
  }
  content = typeof content === 'string' ? content.trim() : ''
  if (!content) {
    throw new Error('Remote chat service returned an empty message')
  }

  // eslint-disable-next-line no-console
  console.log(
    `[${label}] ← %s %d in %dms — response: %s`,
    url,
    response.status,
    duration,
    preview(content, 160),
  )

  return {
    content,
    payload,
    status: response.status,
    duration,
    baseUrl: base,
  }
}
