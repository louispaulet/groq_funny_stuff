import candidateSchema from '../offCandidateSchema.js'

export const API_ROOT = 'https://world.openfoodfacts.org'
export const PRODUCT_PAGE_DEFAULT_LOCALE = 'fr'
export const PRODUCT_PAGE_ROOTS = {
  fr: 'https://fr.openfoodfacts.org/produit',
  world: 'https://world.openfoodfacts.org/product',
}
export const CLASSIC_SEARCH_ENDPOINT = `${API_ROOT}/cgi/search.pl`
export const PRODUCT_ENDPOINT = `${API_ROOT}/api/v2/product`
export const SEARCH_FIELDS = [
  'code',
  'product_name',
  'brands',
  'allergens',
  'allergens_imported',
  'allergens_hierarchy',
  'allergens_tags',
  'allergens_en',
  'traces',
  'traces_tags',
  'ingredients_text',
  'ingredients_text_en',
  'ingredients_analysis_tags',
  'link',
  'url',
]

export const TAG_PREFIX = /en:/gi
export const BARCODE_REGEX = /\b(\d{8,14})\b/
export const STOPWORDS = new Set([
  'a', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can',
  'could', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'if', 'in', 'into',
  'is', 'it', 'me', 'my', 'of', 'on', 'or', 'please', 'safe', 'should', 'tell',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'those', 'to', 'was', 'were', 'what', 'when', 'where', 'which', 'who', 'will',
  'with', 'would', 'about', 'allergen', 'allergens', 'allergy', 'allergies',
  'contains', 'contain', 'containing', 'doesn', 'don', 'have', 'having', 's',
  'you', 'know',
])

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b'

export { candidateSchema }

export function buildProductPageUrl(code, { locale = PRODUCT_PAGE_DEFAULT_LOCALE } = {}) {
  const normalized = `${code || ''}`.trim()
  if (!normalized) return ''
  const root = PRODUCT_PAGE_ROOTS[locale] || PRODUCT_PAGE_ROOTS[PRODUCT_PAGE_DEFAULT_LOCALE] || PRODUCT_PAGE_ROOTS.world
  if (!root) return ''
  return `${root}/${normalized}`
}
