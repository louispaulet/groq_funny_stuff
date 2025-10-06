const CAR_GALLERY_COOKIE_NAME = 'allin_car_gallery'
const MONTH_IN_SECONDS = 60 * 60 * 24 * 30
const CAR_GALLERY_LIMIT = 40

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

export function readCarGallery() {
  const raw = readRawCookie(CAR_GALLERY_COOKIE_NAME)
  if (!raw) return []

  try {
    const parsed = JSON.parse(decodeURIComponent(raw))
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((entry) => normaliseEntry(entry))
      .filter(Boolean)
      .slice(0, CAR_GALLERY_LIMIT)
  } catch {
    return []
  }
}

export function writeCarGallery(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    writeRawCookie(CAR_GALLERY_COOKIE_NAME, '[]')
    return
  }

  const payload = entries
    .map((entry) => normaliseEntry(entry))
    .filter(Boolean)
    .slice(0, CAR_GALLERY_LIMIT)

  writeRawCookie(CAR_GALLERY_COOKIE_NAME, JSON.stringify(payload))
}

export function appendCarGalleryEntry(entry) {
  const normalised = normaliseEntry(entry)
  if (!normalised) {
    return readCarGallery()
  }

  const existing = readCarGallery().filter((item) => item.url !== normalised.url)
  const next = [normalised, ...existing].slice(0, CAR_GALLERY_LIMIT)
  writeCarGallery(next)
  return next
}

export function clearCarGallery() {
  writeRawCookie(CAR_GALLERY_COOKIE_NAME, '[]', 0)
}

export function countCarGalleryEntries() {
  return readCarGallery().length
}

export { CAR_GALLERY_LIMIT, CAR_GALLERY_COOKIE_NAME }

