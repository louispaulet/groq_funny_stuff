import { test } from 'node:test'
import assert from 'node:assert/strict'

import { parseLLMCandidateResponse } from '../candidateUtils.js'

test('parses direct JSON object payload', () => {
  const input = '{"terms": ["Nutella", "hazelnuts", "nuts"]}'
  const result = parseLLMCandidateResponse(input)
  assert.deepEqual(result, ['Nutella', 'hazelnuts', 'nuts'])
})

test('parses JSON object after model reasoning text', () => {
  const input = [
    'We need to generate OpenFoodFacts search terms.',
    'Focus on product keywords.',
    '{"terms": ["Nutella", "hazelnuts", "nuts"]}',
  ].join('\n')

  const result = parseLLMCandidateResponse(input)
  assert.deepEqual(result, ['Nutella', 'hazelnuts', 'nuts'])
})

test('parses array payloads when schema omitted', () => {
  const input = '["Nutella", "hazelnuts", "nuts"]'
  const result = parseLLMCandidateResponse(input)
  assert.deepEqual(result, ['Nutella', 'hazelnuts', 'nuts'])
})

test('ignores invalid tokens and returns empty array when no terms', () => {
  const input = 'unexpected output without schema'
  const result = parseLLMCandidateResponse(input)
  assert.deepEqual(result, [])
})
