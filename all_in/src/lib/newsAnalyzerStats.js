const STORAGE_KEY = 'newsanalyzer_classification_count_v1'

function getStorage() {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

function readRawCount() {
  const storage = getStorage()
  if (!storage) return 0
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const parsed = Number.parseInt(raw, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  } catch {
    return 0
  }
}

export function readNewsClassificationCount() {
  return readRawCount()
}

export function incrementNewsClassificationCount() {
  const storage = getStorage()
  if (!storage) return
  const next = readRawCount() + 1
  try {
    storage.setItem(STORAGE_KEY, String(next))
  } catch {
    // ignore quota errors
  }
}

export function clearNewsClassificationCount() {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // ignore quota errors
  }
}
