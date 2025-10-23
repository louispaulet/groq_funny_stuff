import { clearChunkedCookie, readChunkedCookie, writeChunkedCookie } from './cookieUtils'

const MERMAID_HISTORY_COOKIE_NAME = 'allin_mermaid_history'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30
const MERMAID_HISTORY_LIMIT = 12

function normaliseSvgMarkup(svgMarkup) {
  if (typeof svgMarkup !== 'string') return ''
  const trimmed = svgMarkup.trim()
  if (!trimmed) return ''
  return trimmed
}

function sanitiseEntry(entry) {
  if (!entry) return null

  const prompt = typeof entry.prompt === 'string' ? entry.prompt.trim() : ''
  const svgMarkup = normaliseSvgMarkup(entry.svgMarkup)

  if (!svgMarkup) return null

  const timestamp = typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp)
    ? entry.timestamp
    : Date.now()

  return {
    prompt,
    svgMarkup,
    timestamp,
  }
}

export function readMermaidHistory() {
  const raw = readChunkedCookie(MERMAID_HISTORY_COOKIE_NAME)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(sanitiseEntry).filter(Boolean)
  } catch {
    return []
  }
}

export function writeMermaidHistory(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    clearChunkedCookie(MERMAID_HISTORY_COOKIE_NAME)
    return
  }

  const payload = entries
    .map((entry) => sanitiseEntry(entry))
    .filter(Boolean)
    .slice(0, MERMAID_HISTORY_LIMIT)

  if (payload.length === 0) {
    clearChunkedCookie(MERMAID_HISTORY_COOKIE_NAME)
    return
  }

  writeChunkedCookie(MERMAID_HISTORY_COOKIE_NAME, payload, { maxAgeSeconds: MONTH_IN_SECONDS })
}

export function appendMermaidHistoryEntry(entry) {
  const sanitised = sanitiseEntry(entry)
  if (!sanitised) {
    return readMermaidHistory()
  }

  const existing = readMermaidHistory()
  const next = [sanitised, ...existing.filter((item) => item.svgMarkup !== sanitised.svgMarkup || item.prompt !== sanitised.prompt)]
    .slice(0, MERMAID_HISTORY_LIMIT)

  writeMermaidHistory(next)
  return next
}

export function clearMermaidHistory() {
  clearChunkedCookie(MERMAID_HISTORY_COOKIE_NAME)
}

export { MERMAID_HISTORY_LIMIT, MERMAID_HISTORY_COOKIE_NAME }
