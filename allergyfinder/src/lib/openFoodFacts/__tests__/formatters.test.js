import { test } from 'node:test'
import assert from 'node:assert/strict'

import { formatProductContext } from '../formatters.js'

test('formats context with allergens, traces, and ingredients', () => {
  const product = {
    product_name: 'Nutella',
    brands: 'Ferrero',
    code: '3017620425035',
    allergens: 'en:nuts,en:milk',
    traces_tags: ['en:gluten'],
    ingredients_analysis_tags: ['en:palm-oil:yes', 'en:vegan:no'],
    ingredients_text_en: 'Sugar, palm oil, hazelnuts, cocoa, skim milk, soy lecithin, vanillin',
    link: 'https://example.com/nutella',
  }

  const context = formatProductContext(product)

  assert.ok(context.includes('Product: Nutella (Ferrero)'))
  assert.ok(context.includes('Barcode: 3017620425035'))
  assert.ok(context.includes('Reported allergens: nuts, milk'))
  assert.ok(context.includes('Possible traces: gluten'))
  assert.ok(context.includes('Ingredient analysis tags: palm-oil:yes, vegan:no'))
  assert.ok(context.includes('Ingredients summary: Sugar, palm oil, hazelnuts, cocoa, skim milk, soy lecithin, vanillin'))
  assert.ok(context.includes('OpenFoodFacts product page: https://fr.openfoodfacts.org/produit/3017620425035'))
  assert.ok(context.includes('Source: https://example.com/nutella'))
  assert.ok(context.includes('Reminder: verify allergen information'))
})

test('falls back to defaults when product data missing', () => {
  const product = {
    code: '123',
  }

  const context = formatProductContext(product)

  assert.ok(context.includes('Product: Unknown product'))
  assert.ok(context.includes('Barcode: 123'))
  assert.ok(context.includes('Reported allergens: none listed in OpenFoodFacts'))
  assert.ok(context.includes('Reminder: verify allergen information'))
})

test('truncates ingredients and builds fallback source link', () => {
  const longText = 'a'.repeat(650)
  const product = {
    code: '999',
    product_name: 'Test Product',
    ingredients_text: longText,
  }

  const context = formatProductContext(product)

  const expectedSnippet = `${'a'.repeat(600)}…`
  assert.ok(context.includes(expectedSnippet))
  assert.ok(context.includes('OpenFoodFacts product page: https://fr.openfoodfacts.org/produit/999'))
  assert.ok(context.includes('Source: https://world.openfoodfacts.org/product/999'))
})
