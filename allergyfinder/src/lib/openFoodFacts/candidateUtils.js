import { candidateSchema } from './constants.js'

export function normalizeCandidateTerm(term) {
  if (!term || typeof term !== 'string') return ''
  return term.replace(/["`]/g, '').replace(/\s+/g, ' ').trim()
}

export function parseLLMCandidateResponse(text) {
  if (!text) return []
  const trimmed = text.trim()

  const tryParseJson = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  let parsed = tryParseJson(trimmed)
  if (!parsed) {
    const matches = trimmed.match(/\{[\s\S]*\}/g)
    if (matches && matches.length) {
      for (let i = matches.length - 1; i >= 0; i -= 1) {
        const candidate = tryParseJson(matches[i])
        if (candidate && (Array.isArray(candidate) || typeof candidate === 'object')) {
          parsed = candidate
          break
        }
      }
    }
  }

  if (!parsed) return []

  const terms = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.terms)
      ? parsed.terms
      : []

  if (!terms.length) return []

  const maxItems = candidateSchema?.properties?.terms?.maxItems ?? 6
  const minItems = candidateSchema?.properties?.terms?.minItems ?? 1
  const sanitized = []
  const seen = new Set()
  for (const term of terms) {
    const normalized = normalizeCandidateTerm(term)
    if (!normalized) continue
    if (!/^[\p{L}\p{N}][\p{L}\p{N} '\-()/.,&]*$/u.test(normalized)) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    sanitized.push(normalized)
    if (sanitized.length >= maxItems) break
  }

  return sanitized.length >= minItems ? sanitized : []
}
