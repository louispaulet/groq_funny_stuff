const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365
const DEFAULT_CHUNK_SIZE = 3500

function getDocument() {
  return typeof document === 'undefined' ? null : document
}

function parseCookies(doc = getDocument()) {
  if (!doc || !doc.cookie) return []
  return doc.cookie
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const eqIndex = entry.indexOf('=')
      if (eqIndex === -1) {
        return { name: entry, value: '' }
      }
      return {
        name: entry.slice(0, eqIndex),
        value: entry.slice(eqIndex + 1),
      }
    })
}

function readCookieValue(name) {
  if (!name) return ''
  const match = parseCookies().find((cookie) => cookie.name === name)
  return match ? match.value : ''
}

function writeCookie(name, value, maxAgeSeconds = DEFAULT_MAX_AGE) {
  const doc = getDocument()
  if (!doc || !name) return
  const encoded = encodeURIComponent(value)
  doc.cookie = `${name}=${encoded}; path=/; max-age=${maxAgeSeconds}`
}

function deleteCookie(name) {
  const doc = getDocument()
  if (!doc || !name) return
  doc.cookie = `${name}=; path=/; max-age=0`
}

function clearChunkedCookie(name) {
  const doc = getDocument()
  if (!doc || !name || !doc.cookie) return
  const prefix = `${name}__`
  parseCookies(doc)
    .filter((cookie) => cookie.name === name || cookie.name.startsWith(prefix))
    .forEach((cookie) => {
      doc.cookie = `${cookie.name}=; path=/; max-age=0`
    })
}

function readChunkedCookie(name) {
  if (!name) return ''
  const prefix = `${name}__`
  const chunks = parseCookies()
    .filter((cookie) => cookie.name === name || cookie.name.startsWith(prefix))
    .map((cookie) => ({
      name: cookie.name,
      value: cookie.value || '',
      index: cookie.name === name ? 0 : Number.parseInt(cookie.name.slice(prefix.length), 10),
    }))
    .filter((chunk) => Number.isInteger(chunk.index) && chunk.index >= 0)
    .sort((a, b) => a.index - b.index)
  if (chunks.length === 0) return ''
  const encoded = chunks.map((chunk) => chunk.value).join('')
  if (!encoded) return ''
  try {
    return decodeURIComponent(encoded)
  } catch {
    return ''
  }
}

function writeChunkedCookie(name, value, { maxAgeSeconds = DEFAULT_MAX_AGE, chunkSize = DEFAULT_CHUNK_SIZE } = {}) {
  const doc = getDocument()
  if (!doc || !name) return
  const payload = typeof value === 'string' ? value : JSON.stringify(value)
  if (!payload) {
    clearChunkedCookie(name)
    return
  }
  const encoded = encodeURIComponent(payload)
  const size = Math.max(1, Number.parseInt(chunkSize, 10) || DEFAULT_CHUNK_SIZE)
  clearChunkedCookie(name)
  for (let index = 0; index * size < encoded.length; index += 1) {
    const start = index * size
    const segment = encoded.slice(start, start + size)
    const chunkName = index === 0 ? name : `${name}__${index}`
    doc.cookie = `${chunkName}=${segment}; path=/; max-age=${maxAgeSeconds}`
  }
}

export {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_AGE,
  clearChunkedCookie,
  deleteCookie,
  getDocument,
  parseCookies,
  readChunkedCookie,
  readCookieValue,
  writeChunkedCookie,
  writeCookie,
}
