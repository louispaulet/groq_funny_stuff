const OPEN_FOOD_FACTS_URL_PATTERN = /openfoodfacts\.org\/(?:[a-z]{2}\/)?produit\/(\d{6,})/gi
const BARE_CODE_PATTERN = /\b(\d{8,18})\b/g

function extractOpenFoodFactsCode(input) {
  if (!input) return null
  const text = String(input)

  OPEN_FOOD_FACTS_URL_PATTERN.lastIndex = 0
  let urlMatch
  while ((urlMatch = OPEN_FOOD_FACTS_URL_PATTERN.exec(text))) {
    const code = urlMatch[1]
    if (code) {
      return code
    }
  }

  const compact = text.replace(/[^0-9]/g, '')
  const nonBarcodeCharacters = text.replace(/[0-9\s-]/g, '')
  if (compact.length >= 8 && compact.length <= 18 && !nonBarcodeCharacters) {
    return compact
  }

  BARE_CODE_PATTERN.lastIndex = 0
  const bareMatch = BARE_CODE_PATTERN.exec(text)
  if (bareMatch && bareMatch[1]) {
    return bareMatch[1]
  }

  return null
}

async function fetchFlavorFinderProduct(baseUrl, code, { signal } = {}) {
  const trimmedBase = typeof baseUrl === 'string' ? baseUrl.trim().replace(/\/$/, '') : ''
  if (!trimmedBase || !code) return null
  const url = `${trimmedBase}/flavor-finder/${encodeURIComponent(code)}`
  console.log(`Calling flavor finder API: ${url}`)

  let response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal,
    })
  } catch (error) {
    const wrapped = new Error(`Flavor Finder request failed: ${error?.message || error}`)
    wrapped.cause = error
    throw wrapped
  }

  const text = await response.text()
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    payload = null
  }

  console.log('Flavor finder response:', payload)

  if (!response.ok) {
    const error = new Error(`Flavor Finder returned ${response.status}`)
    error.status = response.status
    error.body = text
    throw error
  }

  return payload || null
}

function coerceValue(value) {
  if (value === undefined || value === null) return ''
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === undefined || item === null) return ''
        if (typeof item === 'string') return item.trim()
        if (typeof item === 'number' || typeof item === 'boolean') return String(item)
        return ''
      })
      .filter(Boolean)
      .join(', ')
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'string') {
    return value.trim()
  }
  return ''
}

function addDetail(details, label, value) {
  const coerced = coerceValue(value)
  if (!coerced) return
  details.push(`${label}: ${coerced}`)
}

function formatFlavorFinderContext(code, payload) {
  const products = Array.isArray(payload?.products) ? payload.products : []
  if (!code || products.length === 0) return null

  const lines = [`OpenFoodFacts product context for barcode ${code}:`]

  const resolvedUrl = coerceValue(payload?.resolvedUrl)
  if (resolvedUrl) {
    lines.push(`Resolved URL: ${resolvedUrl}`)
  }

  const resolvedSlug = coerceValue(payload?.resolvedSlug)
  if (resolvedSlug) {
    lines.push(`Resolved slug: ${resolvedSlug}`)
  }

  const sources = coerceValue(payload?.sources)
  if (sources) {
    lines.push(`Sources: ${sources}`)
  }

  const maxProducts = 3
  products.slice(0, maxProducts).forEach((product, index) => {
    const name = coerceValue(
      product?.name || product?.genericName || product?.generic_name || product?.product_name,
    ) || `Product ${index + 1}`
    const header = `Product ${index + 1}: ${name}`
    lines.push(header)

    const details = []
    addDetail(details, 'Brands', product?.brands)
    addDetail(details, 'Quantity', product?.quantity)
    addDetail(details, 'Serving size', product?.servingSize || product?.serving_size)
    addDetail(details, 'Nutri-Score', product?.nutriscore || product?.nutrition_grade)
    addDetail(details, 'NOVA group', product?.nova)
    addDetail(details, 'Labels', product?.labels)
    addDetail(details, 'Categories', product?.categories)
    addDetail(details, 'Ingredients', product?.ingredients)
    addDetail(details, 'Allergens', product?.allergens)
    addDetail(details, 'Traces', product?.traces)
    addDetail(details, 'Additives', product?.additives)
    addDetail(details, 'Ingredients analysis', product?.ingredientsAnalysis || product?.ingredients_analysis)

    if (details.length > 0) {
      details.forEach((detail) => {
        lines.push(`  - ${detail}`)
      })
    }
  })

  if (products.length > maxProducts) {
    lines.push(`(+ ${products.length - maxProducts} additional products omitted)`)
  }

  return lines.join('\n')
}

async function buildFlavorFinderContext(baseUrl, text, { signal } = {}) {
  const code = extractOpenFoodFactsCode(text)
  if (!code) return null
  const payload = await fetchFlavorFinderProduct(baseUrl, code, { signal })
  if (!payload) return null
  const summary = formatFlavorFinderContext(code, payload)
  if (!summary) return null
  return { code, summary, payload }
}

export { buildFlavorFinderContext, extractOpenFoodFactsCode, fetchFlavorFinderProduct, formatFlavorFinderContext }
