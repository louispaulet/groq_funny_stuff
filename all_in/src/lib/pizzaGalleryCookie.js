const PIZZA_GALLERY_COOKIE_NAME = 'allin_pizza_gallery'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30
const PIZZA_GALLERY_LIMIT = 40

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

function normaliseEntry(entry) {
  if (!entry || typeof entry.url !== 'string' || !entry.url.trim()) {
    return null
  }

  return {
    prompt: typeof entry.prompt === 'string' ? entry.prompt : '',
    url: entry.url,
    summary: typeof entry.summary === 'string' ? entry.summary : '',
    timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
  }
}

export function readPizzaGallery() {
  const raw = readRawCookie(PIZZA_GALLERY_COOKIE_NAME)
  if (!raw) return []

  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry) => normaliseEntry(entry))
      .filter(Boolean)
      .slice(0, PIZZA_GALLERY_LIMIT)
  } catch {
    return []
  }
}

export function writePizzaGallery(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    writeRawCookie(PIZZA_GALLERY_COOKIE_NAME, '[]')
    return
  }

  const payload = entries
    .map((entry) => normaliseEntry(entry))
    .filter(Boolean)
    .slice(0, PIZZA_GALLERY_LIMIT)

  writeRawCookie(PIZZA_GALLERY_COOKIE_NAME, JSON.stringify(payload))
}

export function appendPizzaGalleryEntry(entry) {
  const normalised = normaliseEntry(entry)
  if (!normalised) {
    return readPizzaGallery()
  }

  const existing = readPizzaGallery().filter((item) => item.url !== normalised.url)
  const next = [normalised, ...existing].slice(0, PIZZA_GALLERY_LIMIT)
  writePizzaGallery(next)
  return next
}

export function clearPizzaGallery() {
  writeRawCookie(PIZZA_GALLERY_COOKIE_NAME, '[]', 0)
}

export function countPizzaGalleryEntries() {
  return readPizzaGallery().length
}

export { PIZZA_GALLERY_LIMIT, PIZZA_GALLERY_COOKIE_NAME }
