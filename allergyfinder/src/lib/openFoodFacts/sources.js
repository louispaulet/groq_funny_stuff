import { API_ROOT } from './constants.js'

export function buildSourcesFromMatch(match) {
  const product = match?.product
  if (!product) return []

  const code = (product.code || '').trim()
  const url = product.link || product.url || (code ? `${API_ROOT}/product/${code}` : '')
  if (!url) return []

  const name = (product.product_name || '').trim()
  const primaryBrand = (product.brands || '')
    .split(',')
    .map((part) => part.trim())
    .find(Boolean)

  let label = name || 'OpenFoodFacts product entry'
  if (primaryBrand) {
    label = name ? `${label} – ${primaryBrand}` : `${primaryBrand} (OpenFoodFacts)`
  }
  if (!name && !primaryBrand && code) {
    label = `OpenFoodFacts product ${code}`
  }

  return [{ label, url, code: code || undefined }]
}
