import {
  DEFAULT_GROQ_MODEL,
  GROQ_ENDPOINT,
  candidateSchema,
} from './constants.js'
import { normalizeCandidateTerm, parseLLMCandidateResponse } from './candidateUtils.js'

const GROQ_CANDIDATE_CACHE = new Map()
let groqSchemaSupported = false

function getGroqApiKey() {
  try {
    if (typeof process !== 'undefined' && process?.env?.VITE_GROQ_API_KEY) {
      return process.env.VITE_GROQ_API_KEY
    }
  } catch {}

  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GROQ_API_KEY) {
      return import.meta.env.VITE_GROQ_API_KEY
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window?.VITE_GROQ_API_KEY) {
      return window.VITE_GROQ_API_KEY
    }
  } catch {}

  try {
    if (typeof globalThis !== 'undefined' && globalThis?.VITE_GROQ_API_KEY) {
      return globalThis.VITE_GROQ_API_KEY
    }
  } catch {}

  return ''
}

function extractOutputText(payload) {
  if (!payload) return ''
  if (typeof payload.output_text === 'string') return payload.output_text
  const outputs = payload.output || payload.outputs || []
  if (Array.isArray(outputs) && outputs.length) {
    return outputs
      .map((entry) => {
        if (typeof entry === 'string') return entry
        const content = entry?.content
        if (typeof content === 'string') return content
        if (Array.isArray(content)) {
          return content
            .map((item) => item?.text || item?.value || '')
            .filter(Boolean)
            .join(' ')
        }
        return entry?.text || entry?.value || ''
      })
      .filter(Boolean)
      .join('\n')
  }
  if (payload?.response?.output) {
    return extractOutputText(payload.response)
  }
  return ''
}

export async function fetchGroqCandidateTerms(raw) {
  const apiKey = getGroqApiKey()
  if (!apiKey || typeof fetch !== 'function') {
    console.log('[OFF] Groq candidate generation skipped (missing api key or fetch).')
    return []
  }
  const cacheKey = raw.trim().toLowerCase()
  if (GROQ_CANDIDATE_CACHE.has(cacheKey)) {
    return GROQ_CANDIDATE_CACHE.get(cacheKey)
  }

  const schemaDescription = '{"terms": ["term1", "term2", ...]}'
  const prompt = [
    'You generate OpenFoodFacts search terms.',
    'Respond ONLY with JSON that matches {"terms": ["term1", "term2", ...]} (min 1, max 6 items).',
    `Use concise product or ingredient keywords from the user query. Schema example: ${schemaDescription}.`,
    'Do not add explanations, markdown, or extra text—return raw JSON only.',
    `User query: ${raw.trim()}`,
  ].join('\n')

  const baseBody = {
    model: DEFAULT_GROQ_MODEL,
    input: prompt,
  }

  const makeRequest = async (useSchema) => {
    const body = useSchema
      ? {
          ...baseBody,
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'off_candidate_terms',
              schema: candidateSchema,
            },
          },
        }
      : baseBody

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      return { ok: false, status: response.status, statusText: response.statusText, errorText }
    }

    const payload = await response.json()
    const text = extractOutputText(payload)
    console.log('[OFF] Raw LLM candidate payload:', text)
    const parsed = parseLLMCandidateResponse(text)
    console.log('[OFF] Parsed LLM candidate terms:', parsed)
    const normalized = Array.from(new Set(parsed.map(normalizeCandidateTerm))).filter(Boolean)
    return { ok: true, normalized }
  }

  try {
    let result = await makeRequest(groqSchemaSupported)
    if (!result.ok && /unknown field `response_format`/i.test(result.errorText || '')) {
      groqSchemaSupported = false
      result = await makeRequest(false)
    }

    if (!result.ok) {
      console.error('Groq candidate generation failed', result.status, result.statusText, result.errorText)
      GROQ_CANDIDATE_CACHE.set(cacheKey, [])
      return []
    }

    GROQ_CANDIDATE_CACHE.set(cacheKey, result.normalized)
    console.log('[OFF] LLM candidate terms:', result.normalized)
    return result.normalized
  } catch (error) {
    console.error('Failed to request Groq candidate terms', error)
    GROQ_CANDIDATE_CACHE.set(cacheKey, [])
    return []
  }
}
