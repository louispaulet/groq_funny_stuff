import { candidateSchema } from './constants.js'
import { normalizeCandidateTerm } from './candidateUtils.js'
import { fetchGroqCandidateTerms } from './groqCandidates.js'
import { buildFallbackCandidateTerms } from './fallbackCandidates.js'

export async function buildCandidateTerms(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const llmTerms = await fetchGroqCandidateTerms(trimmed)
  const fallback = buildFallbackCandidateTerms(trimmed)
  const combined = [...llmTerms, ...fallback]
  const unique = []
  const seen = new Set()
  const maxItems = candidateSchema?.properties?.terms?.maxItems ?? 6

  for (const term of combined) {
    const normalized = normalizeCandidateTerm(term)
    if (normalized && !seen.has(normalized.toLowerCase())) {
      seen.add(normalized.toLowerCase())
      unique.push(normalized)
    }
    if (unique.length >= maxItems) break
  }

  return unique
}
