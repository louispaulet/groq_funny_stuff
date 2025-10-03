const importMetaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined
const processEnv = typeof globalThis !== 'undefined' && globalThis.process?.env ? globalThis.process.env : undefined

function getEnvValue(key) {
  if (importMetaEnv && importMetaEnv[key] !== undefined) return importMetaEnv[key]
  if (processEnv && processEnv[key] !== undefined) return processEnv[key]
  return undefined
}

const DEFAULT_BASE_URL = (getEnvValue('VITE_CHAT_BASE_URL') || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

function preview(text = '', length = 200) {
  if (!text) return ''
  const trimmed = String(text).trim()
  if (trimmed.length <= length) return trimmed
  return `${trimmed.slice(0, length)}...`
}

export async function callRemoteChat(messages, { signal, model } = {}) {
  const baseUrl = (getEnvValue('VITE_CHAT_BASE_URL') || DEFAULT_BASE_URL).replace(/\/$/, '')
  if (!baseUrl) {
    throw new Error('Missing chat service base URL. Set VITE_CHAT_BASE_URL in your environment.')
  }

  const url = `${baseUrl}/chat`
  const started = performance.now()
  const lastMessage = messages?.[messages.length - 1]
  const lastContent = lastMessage?.content || ''

  console.log(
    '[AllergyFinder] → POST %s — model: %s — question: %s',
    url,
    model || 'default',
    preview(lastContent, 200),
  )

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model ? { model, messages } : { messages }),
    signal,
  })

  const duration = Math.round(performance.now() - started)
  let rawBody = ''
  let payload

  const canReadText = typeof response.text === 'function'
  const canReadJson = typeof response.json === 'function'

  if (canReadText) {
    rawBody = await response.text()
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = undefined
    }
  } else if (canReadJson) {
    payload = await response.json()
    try {
      rawBody = JSON.stringify(payload)
    } catch {
      rawBody = '[object Object]'
    }
  }

  if (!response.ok) {
    console.error('[AllergyFinder] ← %s %d in %dms — body: %s', url, response.status, duration, preview(rawBody, 200))
    throw new Error(`Remote chat service returned ${response.status}`)
  }

  if (!payload) {
    try {
      payload = JSON.parse(rawBody)
    } catch (error) {
      console.error('[AllergyFinder] Failed to parse JSON response', error)
      throw new Error('Remote chat service returned invalid JSON')
    }
  }

  let content = payload?.choices?.[0]?.message?.content
  if (!content && typeof payload?.output_text === 'string') {
    content = payload.output_text
  }
  content = typeof content === 'string' ? content.trim() : ''
  if (!content) {
    console.warn('[AllergyFinder] No message content returned from chat service', payload)
    throw new Error('Remote chat service returned an empty message')
  }

  console.log('[AllergyFinder] ← %s %d in %dms — response: %s', url, response.status, duration, preview(content, 200))

  return {
    content,
    payload,
    status: response.status,
    duration,
  }
}
