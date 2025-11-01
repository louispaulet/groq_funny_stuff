#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const siteUrl = (process.env.SITE_URL || 'https://groq-allin.thefrenchartist.dev').replace(/\/$/, '')

const experiencesFile = join(projectRoot, 'src', 'config', 'experiences.js')
const publicDir = join(projectRoot, 'public')
const sitemapPath = join(publicDir, 'sitemap.xml')

const DEFAULT_CHANGEFREQ = 'weekly'
const DEFAULT_PRIORITY = '0.7'

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/about', changefreq: 'weekly', priority: '0.8' },
  { path: '/profile', changefreq: 'weekly', priority: '0.6' },
  { path: '/bank-holiday-planner', changefreq: 'weekly', priority: '0.8' },
  { path: '/second-hand-food-market', changefreq: 'weekly', priority: '0.7' },
  { path: '/game-of-life-lab', changefreq: 'weekly', priority: '0.7' },
  { path: '/dalle-vs-flux', changefreq: 'weekly', priority: '0.7' },
  { path: '/timeline-studio', changefreq: 'weekly', priority: '0.7' },
]

const extraExperiencePaths = {
  '/allergyfinder': [
    { path: '/allergyfinder/cookies', changefreq: 'monthly', priority: '0.4' },
  ],
  '/objectmaker': [
    { path: '/objectmaker/zoo', changefreq: 'weekly', priority: '0.6' },
  ],
  '/imagegen': [
    { path: '/imagegen/gallery', changefreq: 'weekly', priority: '0.6' },
  ],
}

function extractExperiencePaths(filePath) {
  const fileContents = readFileSync(filePath, 'utf8')
  const regex = /path:\s*['"]([^'"]+)['"]/g
  const paths = new Set()
  let match = regex.exec(fileContents)

  while (match) {
    const value = match[1]
    if (value && value.startsWith('/')) {
      paths.add(value)
    }
    match = regex.exec(fileContents)
  }

  return Array.from(paths)
}

function buildRouteList() {
  const routes = new Map()

  staticRoutes.forEach((route) => {
    routes.set(route.path, route)
  })

  const experiencePaths = extractExperiencePaths(experiencesFile)
  experiencePaths.forEach((path) => {
    if (!routes.has(path)) {
      routes.set(path, { path, changefreq: DEFAULT_CHANGEFREQ, priority: DEFAULT_PRIORITY })
    }
    const extras = extraExperiencePaths[path]
    if (extras) {
      extras.forEach((extraRoute) => {
        routes.set(
          extraRoute.path,
          extraRoute,
        )
      })
    }
  })

  const sortedRoutes = Array.from(routes.values()).sort((a, b) => {
    if (a.path === '/') return -1
    if (b.path === '/') return 1
    return a.path.localeCompare(b.path)
  })

  return sortedRoutes
}

function buildSitemapXml(routes) {
  const urlEntries = routes
    .map((route) => {
      const loc = `${siteUrl}${route.path === '/' ? '/' : route.path}`
      const changefreq = route.changefreq || DEFAULT_CHANGEFREQ
      const priority = route.priority || DEFAULT_PRIORITY
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlEntries,
    '</urlset>',
    '',
  ].join('\n')
}

function main() {
  const routes = buildRouteList()
  const xml = buildSitemapXml(routes)
  writeFileSync(sitemapPath, xml, 'utf8')
  console.log(`Sitemap updated with ${routes.length} routes at ${sitemapPath}`)
}

main()
