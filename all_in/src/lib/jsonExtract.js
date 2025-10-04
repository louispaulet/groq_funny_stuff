export function tryParseJson(text) {
  if (!text) return null
  try {
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    return null
  }
  return null
}

export function extractFromFencedCode(text) {
  if (!text) return null
  const fence = /```(?:json)?\s*([\s\S]*?)```/i
  const m = text.match(fence)
  if (!m || !m[1]) return null
  return tryParseJson(m[1].trim())
}

export function extractFirstObject(text) {
  if (!text) return null
  const s = String(text)
  const start = s.indexOf('{')
  if (start < 0) return null
  let depth = 0
  for (let i = start; i < s.length; i++) {
    const ch = s[i]
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        const candidate = s.slice(start, i + 1)
        const parsed = tryParseJson(candidate)
        if (parsed) return parsed
      }
    }
  }
  return null
}

export function extractFirstJson(text) {
  return (
    tryParseJson(text) ||
    extractFromFencedCode(text) ||
    extractFirstObject(text)
  )
}

