import { DEFAULT_GROQ_MODEL } from './constants.js'
import { normalizeCandidateTerm, parseLLMCandidateResponse } from './candidateUtils.js'
import { callRemoteChat } from '../remoteChat.js'

const GROQ_CANDIDATE_CACHE = new Map()

const SYSTEM_PROMPT = [
  'You generate concise OpenFoodFacts search terms.',
  'Respond ONLY with JSON matching {"terms": ["term1", "term2", ...]} (min 1, max 6 items).',
  'Do not add commentary, markdown, or extra text — return raw JSON only.',
].join(' ')

export async function fetchGroqCandidateTerms(raw) {
  const query = raw?.trim()
  if (!query) return []

  const cacheKey = query.toLowerCase()
  if (GROQ_CANDIDATE_CACHE.has(cacheKey)) {
    return GROQ_CANDIDATE_CACHE.get(cacheKey)
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: [
        `User query: ${query}`,
        'Return JSON: {"terms": ["term1", ...]}',
      ].join('\n'),
    },
  ]

  try {
    const { content } = await callRemoteChat(messages, { model: DEFAULT_GROQ_MODEL })
    const parsed = parseLLMCandidateResponse(content)
    const normalized = Array.from(new Set(parsed.map(normalizeCandidateTerm))).filter(Boolean)
    GROQ_CANDIDATE_CACHE.set(cacheKey, normalized)
    console.log('[OFF] LLM candidate terms:', normalized)
    return normalized
  } catch (error) {
    console.error('Failed to request candidate search terms via /chat', error)
    GROQ_CANDIDATE_CACHE.set(cacheKey, [])
    return []
  }
}
