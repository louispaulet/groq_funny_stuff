import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildFallbackCandidateTerms } from '../fallbackCandidates.js'

test('builds diverse fallback terms from rich query', () => {
  const input = "tell me about 'Nutella' hazelnut spread for allergies"
  const terms = buildFallbackCandidateTerms(input)

  assert.ok(terms.includes("tell me about 'Nutella' hazelnut spread for allergies"))
  assert.ok(terms.includes("'Nutella'"), 'captures quoted keyword')
  assert.ok(terms.includes('Nutella'), 'includes quote-stripped token')
  assert.ok(terms.includes("'Nutella' hazelnut"), 'includes leading token pairs')
  assert.ok(terms.length <= 6, 'respects schema max items')
})

test('falls back to first token when stopwords dominate', () => {
  const input = 'the'
  const terms = buildFallbackCandidateTerms(input)
  assert.deepEqual(terms, ['the'])
})

test('returns empty array for blank input', () => {
  const terms = buildFallbackCandidateTerms('   ')
  assert.deepEqual(terms, [])
})
