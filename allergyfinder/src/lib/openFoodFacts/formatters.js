import { API_ROOT, TAG_PREFIX, buildProductPageUrl } from './constants.js'

function cleanTag(tag) {
  if (!tag) return ''
  return tag
    .replace(TAG_PREFIX, '')
    .replace(/_/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim()
}

function formatList(list) {
  if (!Array.isArray(list) || list.length === 0) return ''
  return list
    .map((item) => cleanTag(typeof item === 'string' ? item : item?.id || ''))
    .filter(Boolean)
    .join(', ')
}

function truncate(text, max = 600) {
  if (!text) return ''
  if (text.length <= max) return text
  return `${text.slice(0, max)}…`
}

export function formatProductContext(product) {
  const name = product.product_name || 'Unknown product'
  const brand = product.brands || ''
  const allergensRaw =
    product.allergens_imported ||
    product.allergens ||
    product.allergens_en ||
    formatList(product.allergens_tags) ||
    formatList(product.allergens_hierarchy)

  const traces = product.traces || formatList(product.traces_tags)
  const analysis = formatList(product.ingredients_analysis_tags)
  const ingredients = truncate(product.ingredients_text_en || product.ingredients_text)

  const lines = []
  lines.push(`Product: ${name}${brand ? ` (${brand})` : ''}`)
  if (product.code) lines.push(`Barcode: ${product.code}`)
  if (allergensRaw) {
    lines.push(`Reported allergens: ${cleanTag(allergensRaw)}`)
  } else {
    lines.push('Reported allergens: none listed in OpenFoodFacts')
  }
  if (traces) lines.push(`Possible traces: ${traces}`)
  if (analysis) lines.push(`Ingredient analysis tags: ${analysis}`)
  if (ingredients) lines.push(`Ingredients summary: ${ingredients}`)
  const productPage = buildProductPageUrl(product.code)
  const worldPage = product.code ? `${API_ROOT}/product/${product.code}` : ''
  const sourceLink = product.link || product.url || worldPage

  if (productPage) {
    lines.push(`OpenFoodFacts product page: ${productPage}`)
  }
  if (sourceLink && sourceLink !== productPage) {
    lines.push(`Source: ${sourceLink}`)
  }

  lines.push('Reminder: verify allergen information on the official packaging when in doubt.')

  return lines.join('\n')
}
