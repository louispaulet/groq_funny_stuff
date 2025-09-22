import { test } from 'node:test'
import assert from 'node:assert/strict'

async function withPatchedEnvironment(fn) {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.VITE_GROQ_API_KEY

  try {
    return await fn()
  } finally {
    process.env.VITE_GROQ_API_KEY = originalKey
    globalThis.fetch = originalFetch
  }
}

test('buildCandidateTerms merges LLM and fallback outputs', async () => {
  await withPatchedEnvironment(async () => {
    process.env.VITE_GROQ_API_KEY = 'test-key'
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ output_text: '{"terms": ["Nutella", "hazelnuts", "Nutella"]}' }),
    })

    const { buildCandidateTerms } = await import(`../buildCandidateTerms.js?test=${Math.random()}`)
    const terms = await buildCandidateTerms('Nutella question')
    assert.deepEqual(terms, ['Nutella', 'hazelnuts', 'Nutella question'])
  })
})

test('buildCandidateTerms obeys max item limit', async () => {
  await withPatchedEnvironment(async () => {
    process.env.VITE_GROQ_API_KEY = 'test-key'
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({ terms: Array.from({ length: 10 }, (_, i) => `Term ${i + 1}`) }),
      }),
    })

    const { buildCandidateTerms } = await import(`../buildCandidateTerms.js?test=${Math.random()}`)
    const terms = await buildCandidateTerms('Another test query')
    assert.equal(terms.length, 6)
    assert.deepEqual(terms.slice(0, 3), ['Term 1', 'Term 2', 'Term 3'])
  })
})
