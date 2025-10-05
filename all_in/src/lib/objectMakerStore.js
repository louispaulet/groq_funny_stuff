const LS_KEY = 'objectmaker_zoo_v1'

function getStorage() {
  try {
    return globalThis.localStorage || null
  } catch {
    return null
  }
}

export function readZooEntries() {
  const ls = getStorage()
  if (!ls) return []
  try {
    const raw = ls.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function countZooEntries() {
  const entries = readZooEntries()
  return Array.isArray(entries) ? entries.length : 0
}

export function writeZooEntries(entries) {
  const ls = getStorage()
  if (!ls) return
  try {
    ls.setItem(LS_KEY, JSON.stringify(entries || []))
  } catch {
    // ignore quota errors
  }
}

export function addZooEntry(entry) {
  const list = readZooEntries()
  list.unshift(entry)
  writeZooEntries(list)
}

export function clearZoo() {
  const ls = getStorage()
  if (!ls) return
  try {
    ls.removeItem(LS_KEY)
  } catch {
    // ignore
  }
}

export function groupEntriesByType(entries) {
  const map = new Map()
  for (const e of entries || []) {
    const key = (e?.type || 'object').toString()
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  }
  return map
}

