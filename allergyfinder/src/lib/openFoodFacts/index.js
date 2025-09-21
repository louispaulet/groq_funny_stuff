import { BARCODE_REGEX } from './constants.js'
import { buildCandidateTerms } from './buildCandidateTerms.js'
import { fetchProductByBarcode, fetchProductBySearch } from './apiClient.js'
import { formatProductContext } from './formatters.js'

function extractBarcode(text) {
  const match = text.match(BARCODE_REGEX)
  return match?.[1] || ''
}

export async function findOpenFoodFactsMatch(query) {
  const searchTerm = query?.trim()
  if (!searchTerm) return null

  console.log('[OFF] Resolving allergen context for query:', searchTerm)
  const barcode = extractBarcode(searchTerm)
  if (barcode) {
    const product = await fetchProductByBarcode(barcode)
    if (product) {
      const context = formatProductContext(product)
      return { product, context, matchType: 'barcode', candidate: barcode }
    }
  }

  const candidates = await buildCandidateTerms(searchTerm)
  console.log('[OFF] Candidate terms:', candidates)
  for (const candidate of candidates) {
    console.log('[OFF] Trying candidate:', candidate)
    const product = await fetchProductBySearch(candidate)
    if (product) {
      console.log('[OFF] Matched product for candidate:', {
        candidate,
        code: product.code,
        name: product.product_name,
        brands: product.brands,
      })
      const context = formatProductContext(product)
      return { product, context, matchType: 'search', candidate }
    }
    console.log('[OFF] No product found for candidate:', candidate)
  }

  console.log('[OFF] No products resolved for query:', searchTerm)
  return null
}

export async function fetchAllergenContext(query) {
  const match = await findOpenFoodFactsMatch(query)
  return match?.context || ''
}
