const DEFAULT_BASE_URL = (import.meta.env.VITE_CHAT_BASE_URL || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

function preview(text = '', length = 200) {
  if (!text) return ''
  const trimmed = String(text).trim()
  if (trimmed.length <= length) return trimmed
  return `${trimmed.slice(0, length)}...`
}

export async function callRemoteChat(messages, { signal, model } = {}) {
  const baseUrl = (import.meta.env.VITE_CHAT_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '')
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
  const text = await response.text()

  if (!response.ok) {
    console.error('[AllergyFinder] ← %s %d in %dms — body: %s', url, response.status, duration, preview(text, 200))
    throw new Error(`Remote chat service returned ${response.status}`)
  }

  let payload
  try {
    payload = JSON.parse(text)
  } catch (error) {
    console.error('[AllergyFinder] Failed to parse JSON response', error)
    throw new Error('Remote chat service returned invalid JSON')
  }

  const content = payload?.choices?.[0]?.message?.content?.trim()
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
