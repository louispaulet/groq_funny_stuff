import { clearChunkedCookie, readChunkedCookie, writeChunkedCookie } from './cookieUtils'

const HISTORY_COOKIE_NAME = 'allin_svg_prompt_history'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30
const SVG_HISTORY_COOKIE_LIMIT = 8

function normaliseSvgMarkup(svgMarkup) {
  if (typeof svgMarkup !== 'string') return ''
  const trimmed = svgMarkup.trim()
  if (!trimmed) return ''
  return trimmed
}

function buildDataUrl({ dataUrl, svgMarkup }) {
  if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl
  }
  const markup = normaliseSvgMarkup(svgMarkup)
  if (!markup) return ''
  return `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`
}

function sanitiseEntry(entry) {
  if (!entry) return null
  const prompt = typeof entry.prompt === 'string' ? entry.prompt.trim() : ''
  const svgMarkup = normaliseSvgMarkup(entry.svgMarkup)
  const storedDataUrl = typeof entry.dataUrl === 'string' ? entry.dataUrl.trim() : ''
  if (!svgMarkup && !storedDataUrl) return null
  const timestamp = typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp)
    ? entry.timestamp
    : Date.now()

  return {
    prompt,
    svgMarkup,
    dataUrl: buildDataUrl({ dataUrl: storedDataUrl, svgMarkup }),
    timestamp,
  }
}

export function readSvgHistory() {
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

export function writeSvgHistory(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    clearChunkedCookie(HISTORY_COOKIE_NAME)
    return
  }
  const payload = entries
    .map((entry) => {
      const sanitised = sanitiseEntry(entry)
      if (!sanitised) return null
      const { dataUrl: _dataUrl, ...rest } = sanitised
      return rest
    })
    .filter(Boolean)
    .slice(0, SVG_HISTORY_COOKIE_LIMIT)

  if (payload.length === 0) {
    clearChunkedCookie(HISTORY_COOKIE_NAME)
    return
  }

  writeChunkedCookie(HISTORY_COOKIE_NAME, payload, { maxAgeSeconds: MONTH_IN_SECONDS })
}

export function clearSvgHistory() {
  clearChunkedCookie(HISTORY_COOKIE_NAME)
}

export { SVG_HISTORY_COOKIE_LIMIT }
