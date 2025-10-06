import { clearChunkedCookie, readChunkedCookie, writeChunkedCookie } from './cookieUtils'

const HISTORY_COOKIE_NAME = 'allin_flux_image_history'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30

function sanitiseEntry(entry) {
  if (!entry) return null
  const url = typeof entry.url === 'string' ? entry.url.trim() : ''
  if (!url) return null
  const prompt = typeof entry.prompt === 'string' ? entry.prompt : ''
  const timestamp = typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp)
    ? entry.timestamp
    : Date.now()
  return { url, prompt, timestamp }
}

export function readImageHistory() {
  const raw = readChunkedCookie(HISTORY_COOKIE_NAME)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitiseEntry).filter(Boolean)
  } catch {
    return []
  }
}

export function writeImageHistory(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    clearChunkedCookie(HISTORY_COOKIE_NAME)
    return
  }
  const payload = entries.map(sanitiseEntry).filter(Boolean)
  if (payload.length === 0) {
    clearChunkedCookie(HISTORY_COOKIE_NAME)
    return
  }
  writeChunkedCookie(HISTORY_COOKIE_NAME, payload, { maxAgeSeconds: MONTH_IN_SECONDS })
}

export function clearImageHistory() {
  clearChunkedCookie(HISTORY_COOKIE_NAME)
}
export const IMAGE_HISTORY_COOKIE_LIMIT = Number.POSITIVE_INFINITY
