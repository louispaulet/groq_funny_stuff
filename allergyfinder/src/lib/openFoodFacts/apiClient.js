import { PRODUCT_ENDPOINT, SEARCH_FIELDS, CLASSIC_SEARCH_ENDPOINT } from './constants.js'

async function fetchJson(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error('OpenFoodFacts request failed', response.status, response.statusText, url)
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch OpenFoodFacts data', error)
    return null
  }
}

export async function fetchProductByBarcode(code) {
  const params = new URLSearchParams({
    fields: SEARCH_FIELDS.join(','),
  })
  const url = `${PRODUCT_ENDPOINT}/${code}?${params.toString()}`
  console.log('[OFF] Fetching by barcode', code, url)
  const data = await fetchJson(url)
  if (!data?.product) {
    console.log('[OFF] No product returned for barcode', code)
  }
  return data?.product || null
}

export async function fetchProductBySearch(term) {
  const params = new URLSearchParams({
    action: 'process',
    search_terms: term,
    search_simple: '1',
    json: '1',
    page_size: '1',
    fields: SEARCH_FIELDS.join(','),
  })
  const url = `${CLASSIC_SEARCH_ENDPOINT}?${params.toString()}`
  console.log('[OFF] Searching term', term, url)
  const data = await fetchJson(url)
  if (!data?.products?.length) {
    console.log('[OFF] Search returned no products for', term)
  }
  return data?.products?.find(Boolean) || null
}
