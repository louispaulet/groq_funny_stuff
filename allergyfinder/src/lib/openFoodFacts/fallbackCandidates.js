import { STOPWORDS, candidateSchema } from './constants.js'

function normalizeQuotes(text) {
  return text.replace(/[’`]/g, "'")
}

function tokenize(text) {
  const normalized = normalizeQuotes(text)
    .replace(/[^A-Za-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!normalized) return []
  return normalized.split(' ')
}

export function buildFallbackCandidateTerms(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return []
  const candidates = new Set()
  candidates.add(trimmed)

  const quoted = [...trimmed.matchAll(/['"“”]([^'"“”]{3,})['"“”]/g)].map((m) => m[1])
  quoted.forEach((q) => candidates.add(q.trim()))

  const tokens = tokenize(trimmed)
  if (tokens.length) {
    candidates.add(tokens.join(' '))
  }

  const filtered = tokens.filter((token) => !STOPWORDS.has(token.toLowerCase()))
  if (filtered.length) {
    candidates.add(filtered.join(' '))
    candidates.add(filtered[0])
    if (filtered.length >= 2) {
      candidates.add(`${filtered[0]} ${filtered[1]}`)
      candidates.add(filtered.slice(0, 3).join(' '))
    }
  } else if (tokens.length) {
    candidates.add(tokens[0])
  }

  const capitalized = tokens.filter((token) => /^[A-Z]/.test(token))
  if (capitalized.length) {
    candidates.add(capitalized.join(' '))
    candidates.add(capitalized[0])
    if (capitalized.length >= 2) {
      candidates.add(`${capitalized[0]} ${capitalized[1]}`)
    }
  }

  const maxItems = candidateSchema?.properties?.terms?.maxItems ?? 6
  return Array.from(candidates)
    .map((c) => c.trim())
    .filter((c) => c.length > 1)
    .slice(0, maxItems)
}
