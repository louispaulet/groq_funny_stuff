const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365
const DEFAULT_CHUNK_SIZE = 3500
const STORAGE_PREFIX = '__allin_cookie__'

function getDocument() {
  return typeof document === 'undefined' ? null : document
}

function getWindow() {
  return typeof window === 'undefined' ? null : window
}

function getLocalStorage() {
  const win = getWindow()
  if (!win || !win.localStorage) return null
  try {
    const { localStorage } = win
    const testKey = '__cookie_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return localStorage
  } catch {
    return null
  }
}

function buildStorageKey(name) {
  return `${STORAGE_PREFIX}${name}`
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

function clearStorageRecord(name) {
  if (!name) return
  const storage = getLocalStorage()
  if (!storage) return
  try {
    storage.removeItem(buildStorageKey(name))
  } catch {
    // ignore storage errors
  }
}

function readStorageRecord(name) {
  if (!name) return null
  const storage = getLocalStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(buildStorageKey(name))
    if (!raw) return null
    const record = JSON.parse(raw)
    if (!record || typeof record.value !== 'string') {
      storage.removeItem(buildStorageKey(name))
      return null
    }
    if (typeof record.expiresAt === 'number' && Number.isFinite(record.expiresAt)) {
      if (record.expiresAt <= Date.now()) {
        storage.removeItem(buildStorageKey(name))
        return null
      }
    }
    return record.value
  } catch {
    storage.removeItem(buildStorageKey(name))
    return null
  }
}

function writeStorageRecord(name, value, maxAgeSeconds) {
  if (!name) return false
  const storage = getLocalStorage()
  if (!storage) return false
  try {
    const parsedMaxAge = Number.parseInt(maxAgeSeconds, 10)
    const expiresAt =
      Number.isFinite(parsedMaxAge) && parsedMaxAge > 0 ? Date.now() + parsedMaxAge * 1000 : null
    const payload = JSON.stringify({
      value,
      expiresAt,
    })
    storage.setItem(buildStorageKey(name), payload)
    return true
  } catch {
    return false
  }
}

function clearLegacyChunkedCookies(name) {
  const doc = getDocument()
  if (!doc || !name || !doc.cookie) return
  const prefix = `${name}__`
  parseCookies(doc)
    .filter((cookie) => cookie.name === name || cookie.name.startsWith(prefix))
    .forEach((cookie) => {
      doc.cookie = `${cookie.name}=; path=/; max-age=0`
    })
}

function clearChunkedCookie(name) {
  clearLegacyChunkedCookies(name)
  clearStorageRecord(name)
}

function readChunkedCookie(name) {
  if (!name) return ''
  const stored = readStorageRecord(name)
  if (stored !== null && stored !== undefined) {
    return stored
  }
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
    const decoded = decodeURIComponent(encoded)
    if (writeStorageRecord(name, decoded)) {
      clearLegacyChunkedCookies(name)
    }
    return decoded
  } catch {
    return ''
  }
}

function writeChunkedCookie(name, value, { maxAgeSeconds = DEFAULT_MAX_AGE, chunkSize = DEFAULT_CHUNK_SIZE } = {}) {
  const payload = typeof value === 'string' ? value : JSON.stringify(value)
  if (!payload) {
    clearChunkedCookie(name)
    return
  }
  if (writeStorageRecord(name, payload, maxAgeSeconds)) {
    clearLegacyChunkedCookies(name)
    return
  }
  const doc = getDocument()
  if (!doc || !name) return
  const encoded = encodeURIComponent(payload)
  const size = Math.max(1, Number.parseInt(chunkSize, 10) || DEFAULT_CHUNK_SIZE)
  clearLegacyChunkedCookies(name)
  for (let index = 0; index * size < encoded.length; index += 1) {
    const start = index * size
    const segment = encoded.slice(start, start + size)
    const chunkName = index === 0 ? name : `${name}__${index}`
    doc.cookie = `${chunkName}=${segment}; path=/; max-age=${maxAgeSeconds}`
  }
}

function flushCookieStorage() {
  const storage = getLocalStorage()
  if (!storage) return
  const keysToDelete = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keysToDelete.push(key)
    }
  }
  keysToDelete.forEach((key) => {
    try {
      storage.removeItem(key)
    } catch {
      // ignore storage errors
    }
  })
}

export {
  DEFAULT_CHUNK_SIZE,
  DEFAULT_MAX_AGE,
  clearChunkedCookie,
  flushCookieStorage,
  deleteCookie,
  getDocument,
  parseCookies,
  readChunkedCookie,
  readCookieValue,
  writeChunkedCookie,
  writeCookie,
}
