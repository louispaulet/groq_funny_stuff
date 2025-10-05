const HISTORY_COOKIE_NAME = 'allin_flux_image_history'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30
const HISTORY_LIMIT = 60

function getDocument() {
  return typeof document === 'undefined' ? null : document
}

function readRawCookie(name) {
  const doc = getDocument()
  if (!doc || !doc.cookie) return ''
  const cookies = doc.cookie.split('; ')
  const target = cookies.find((cookie) => cookie.startsWith(`${name}=`))
  if (!target) return ''
  return target.split('=').slice(1).join('=')
}

function writeRawCookie(name, value, maxAgeSeconds = MONTH_IN_SECONDS) {
  const doc = getDocument()
  if (!doc) return
  const encoded = encodeURIComponent(value)
  const attributes = [`path=/`, `max-age=${maxAgeSeconds}`]
  doc.cookie = `${name}=${encoded}; ${attributes.join('; ')}`
}

export function readImageHistory() {
  const raw = readRawCookie(HISTORY_COOKIE_NAME)
  if (!raw) return []
  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((entry) => ({
        prompt: typeof entry?.prompt === 'string' ? entry.prompt : '',
        url: typeof entry?.url === 'string' ? entry.url : '',
        timestamp: typeof entry?.timestamp === 'number' ? entry.timestamp : Date.now(),
      }))
      .filter((entry) => entry.url)
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

export function writeImageHistory(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    writeRawCookie(HISTORY_COOKIE_NAME, '[]')
    return
  }

  const payload = entries
    .filter((entry) => entry && typeof entry.url === 'string' && entry.url)
    .slice(0, HISTORY_LIMIT)
    .map((entry) => ({
      prompt: typeof entry.prompt === 'string' ? entry.prompt : '',
      url: entry.url,
      timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
    }))

  writeRawCookie(HISTORY_COOKIE_NAME, JSON.stringify(payload))
}

export function clearImageHistory() {
  writeRawCookie(HISTORY_COOKIE_NAME, '[]', 0)
}

export const IMAGE_HISTORY_COOKIE_LIMIT = HISTORY_LIMIT
