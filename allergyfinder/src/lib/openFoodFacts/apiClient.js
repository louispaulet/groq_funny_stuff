import { PRODUCT_ENDPOINT, SEARCH_FIELDS, CLASSIC_SEARCH_ENDPOINT, buildProductPageUrl } from './constants.js'

const PRODUCT_PAGE_CACHE = new Map()

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined'

function slugify(value = '') {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function guessProductSlug(product) {
  if (!product) return ''

  const nameCandidates = [
    product.product_name_fr,
    product.product_name,
    product.generic_name_fr,
    product.generic_name,
    product.abbreviated_product_name_fr,
    product.abbreviated_product_name,
  ]
  const brandCandidates = (product.brands || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  const nameSlug = nameCandidates
    .map((candidate) => slugify(candidate || ''))
    .find(Boolean) || ''

  const brandSlug = brandCandidates
    .map((candidate) => slugify(candidate))
    .find(Boolean) || ''

  if (!nameSlug && !brandSlug) return ''

  if (nameSlug && brandSlug) {
    if (nameSlug.includes(brandSlug)) return nameSlug
    return slugify(`${nameSlug}-${brandSlug}`)
  }

  return nameSlug || brandSlug
}

async function resolveProductPageUrl(product) {
  const code = `${product?.code || ''}`.trim()
  if (!code) return ''
  if (PRODUCT_PAGE_CACHE.has(code)) {
    return PRODUCT_PAGE_CACHE.get(code) || ''
  }

  const guessedSlug = guessProductSlug(product)
  const baseUrl = buildProductPageUrl(code)
  const slugUrl = guessedSlug ? buildProductPageUrl(code, { slug: guessedSlug }) : ''

  if (isBrowser) {
    const resolved = slugUrl || baseUrl
    PRODUCT_PAGE_CACHE.set(code, resolved)
    return resolved
  }

  async function attempt(url, method) {
    if (!url) return ''
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
      })
      if (response?.url) {
        if (response.ok) return response.url
        if (response.status >= 300 && response.status < 400) {
          const location = response.headers?.get?.('location')
          if (location) {
            return new URL(location, url).toString()
          }
        }
      }
    } catch (error) {
      console.error('[OFF] Failed to resolve product page URL via', method, error)
    }
    return ''
  }

  let resolved = await attempt(slugUrl, 'HEAD')
  if (!resolved) {
    resolved = await attempt(baseUrl, 'HEAD')
  }
  if (!resolved) {
    resolved = await attempt(slugUrl, 'GET')
  }
  if (!resolved) {
    resolved = await attempt(baseUrl, 'GET')
  }
  if (!resolved) {
    resolved = slugUrl || baseUrl
  }

  PRODUCT_PAGE_CACHE.set(code, resolved || '')
  return resolved || ''
}

async function withResolvedProductPage(product) {
  if (!product?.code) return product || null
  const resolvedUrl = await resolveProductPageUrl(product)
  if (!resolvedUrl) {
    return { ...product }
  }
  return { ...product, _resolvedProductPageUrl: resolvedUrl }
}

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
  const rawProduct = data?.product
  if (!rawProduct) {
    console.log('[OFF] No product returned for barcode', code)
  }
  if (!rawProduct) return null
  return withResolvedProductPage(rawProduct)
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
  const rawProduct = data?.products?.find(Boolean) || null
  if (!rawProduct) return null
  return withResolvedProductPage(rawProduct)
}
