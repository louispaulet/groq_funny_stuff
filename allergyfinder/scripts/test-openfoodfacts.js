import { pathToFileURL } from 'node:url'

import { findOpenFoodFactsMatch } from '../src/lib/openFoodFacts/index.js'
import { buildSourcesFromMatch } from '../src/lib/openFoodFacts/sources.js'

const API_BASE_V2 = 'https://world.openfoodfacts.org/api/v2'
const API_PATH_SEARCH = '/search'
const API_BASE_CLASSIC = 'https://world.openfoodfacts.org/cgi/search.pl'

const COMMON_FIELDS = [
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
]

async function performV2SearchTerms(query) {
  const params = new URLSearchParams({
    search_terms: query,
    page_size: '1',
    sort_by: 'unique_scans_n',
    fields: COMMON_FIELDS.join(','),
    json: '1',
  })

  const url = `${API_BASE_V2}${API_PATH_SEARCH}?${params.toString()}`
  return runRequest(url)
}

async function performV2QueryParam(query) {
  const params = new URLSearchParams({
    query,
    page_size: '1',
    sort_by: 'unique_scans_n',
    fields: COMMON_FIELDS.join(','),
    json: '1',
  })

  const url = `${API_BASE_V2}${API_PATH_SEARCH}?${params.toString()}`
  return runRequest(url)
}

async function performClassicSearch(query) {
  const params = new URLSearchParams({
    action: 'process',
    search_terms: query,
    search_simple: '1',
    json: '1',
    page_size: '1',
    fields: COMMON_FIELDS.join(','),
  })

  const url = `${API_BASE_CLASSIC}?${params.toString()}`
  return runRequest(url)
}

async function runRequest(url) {
  const started = Date.now()
  const response = await fetch(url)
  const timing = Date.now() - started
  let payload = null
  let ok = response.ok
  let status = response.status
  let product = null
  if (ok) {
    payload = await response.json()
    product = payload?.products?.[0] ?? null
  }
  return { url, started, timing, ok, status, payload, product }
}

function summarizeProduct(product) {
  if (!product) return null
  return {
    code: product.code,
    name: product.product_name,
    brands: product.brands,
    allergens: product.allergens ?? product.allergens_imported ?? product.allergens_en,
    allergens_tags: product.allergens_tags,
    traces: product.traces,
    traces_tags: product.traces_tags,
  }
}

async function testQuery(query) {
  const [searchTerms, queryParam, classic] = await Promise.all([
    performV2SearchTerms(query),
    performV2QueryParam(query),
    performClassicSearch(query),
  ])
  const match = await findOpenFoodFactsMatch(query)
  const context = match?.context || ''
  const sources = buildSourcesFromMatch(match)
  return {
    query,
    variants: {
      v2SearchTerms: {
        label: 'v2 search_terms',
        ...searchTerms,
        summary: summarizeProduct(searchTerms.product),
      },
      v2QueryParam: {
        label: 'v2 query',
        ...queryParam,
        summary: summarizeProduct(queryParam.product),
      },
      classic: {
        label: 'classic search.pl',
        ...classic,
        summary: summarizeProduct(classic.product),
      },
    },
    context,
    match,
    sources,
  }
}

function printResult(result) {
  const { query, variants, context, match, sources } = result
  console.log('========================================')
  console.log(`Query: ${query}`)
  for (const key of Object.keys(variants)) {
    const variant = variants[key]
    console.log(`-- ${variant.label} --`)
    console.log(`Request: ${variant.url}`)
    console.log(`HTTP: ${variant.status} (${variant.ok ? 'ok' : 'error'}) in ${variant.timing}ms`)
    if (!variant.ok) {
      console.log('  Response status not OK.')
      continue
    }
    if (!variant.summary) {
      console.log('  No products returned.')
    } else {
      console.log('  Top product summary:', variant.summary)
    }
    if (variant.payload?.page_count) {
      console.log(`  Available pages: ${variant.payload.page_count}`)
    }
    const warnings = variant.payload?.warnings
    console.log(`  Warnings: ${warnings && warnings.length ? warnings.join('; ') : '<none>'}`)
  }
  console.log('Context snippet:', context ? `${context.slice(0, 280)}${context.length > 280 ? '…' : ''}` : '<empty>')
  if (sources?.length) {
    console.log('Sources:')
    for (const source of sources) {
      console.log(`  - ${source.label} -> ${source.url}`)
    }
  } else {
    console.log('Sources: <none>')
  }
  if (match?.product) {
    console.log('Match details:', {
      matchType: match.matchType,
      candidate: match.candidate,
      code: match.product.code,
      name: match.product.product_name,
      brands: match.product.brands,
    })
  } else {
    console.log('Match details: <none>')
  }
}

async function main() {
  const cliQueries = globalThis.process?.argv?.slice(2) ?? []
  const queries = cliQueries.length
    ? cliQueries
    : [
        'Nutella',
        'Does Nutella have allergens?',
        'Barilla spaghetti gluten',
        'Is Coke safe for peanut allergy?',
        "Trader Joe's Soy Sauce",
        'Random made up product xyz',
        'Lentilles du Puy',
        'hey, what are lentilles du puy ?',
        'what can you tell about lentilles du puy?',
        'what do you know about lentille du puy?',
        '3111950001454',
        'Peanut free chocolate bar',
      ]

  console.log('Running OpenFoodFacts diagnostic tests...')
  for (const query of queries) {
    try {
      const result = await testQuery(query)
      printResult(result)
    } catch (error) {
      console.error('Error while testing query:', query)
      console.error(error)
    }
  }
  console.log('Done.')
}

const isDirectRun = (() => {
  const mainArg = globalThis.process?.argv?.[1]
  if (!mainArg) return false
  try {
    return pathToFileURL(mainArg).href === import.meta.url
  } catch {
    return false
  }
})()

const isNodeTestContext = Boolean(globalThis.process?.env?.NODE_TEST_CONTEXT)

if (isNodeTestContext) {
  const { test } = await import('node:test')
  test('OpenFoodFacts diagnostics (manual)', { skip: true }, () => {})
}

if (isDirectRun && !isNodeTestContext) {
  main()
}
