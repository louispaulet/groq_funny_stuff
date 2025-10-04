import { test } from 'node:test'
import assert from 'node:assert/strict'

import { buildSourcesFromMatch } from '../sources.js'

function createMatch(product) {
  return { product }
}

test('builds label including product name and primary brand', () => {
  const match = createMatch({
    product_name: 'Nutella',
    brands: 'Ferrero, Something else',
    code: '3017620425035',
    link: 'https://example.com/nutella',
  })

  const sources = buildSourcesFromMatch(match)

  assert.equal(sources.length, 1)
  assert.deepEqual(sources[0], {
    label: 'Nutella – Ferrero',
    url: 'https://example.com/nutella',
    code: '3017620425035',
  })
})

test('falls back to brand-only labeling when name missing', () => {
  const match = createMatch({
    brands: 'Trader Joe\'s',
    code: '999',
    url: 'https://example.com/tj',
  })

  const sources = buildSourcesFromMatch(match)

  assert.equal(sources.length, 1)
  assert.deepEqual(sources[0], {
    label: 'Trader Joe\'s (OpenFoodFacts)',
    url: 'https://example.com/tj',
    code: '999',
  })
})

test('falls back to OpenFoodFacts product code when only barcode provided', () => {
  const match = createMatch({
    code: '12345',
  })

  const sources = buildSourcesFromMatch(match)

  assert.equal(sources.length, 1)
  assert.deepEqual(sources[0], {
    label: 'OpenFoodFacts product 12345',
    url: 'https://fr.openfoodfacts.org/produit/12345',
    code: '12345',
  })
})

test('returns empty array when no product url is available', () => {
  const match = createMatch({
    product_name: 'Mystery Snack',
  })

  const sources = buildSourcesFromMatch(match)

  assert.equal(sources.length, 0)
})

test('returns empty array when match lacks product', () => {
  assert.deepEqual(buildSourcesFromMatch(null), [])
})
