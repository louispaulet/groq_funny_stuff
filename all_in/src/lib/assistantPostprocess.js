const OPEN_FOOD_FACTS_URL = 'https://fr.openfoodfacts.org/produit/'
const CITATION_MARK_PATTERN = /【[^】]+】/g

function buildOpenFoodFactsLink(code) {
  const trimmed = String(code || '').replace(/[^0-9]/g, '')
  if (!trimmed) return null
  return `${OPEN_FOOD_FACTS_URL}${trimmed}`
}

function linkifyOpenFoodFactsMentions(text) {
  if (!text) return text
  const pattern = /(Open[\s\u00a0\u202f-]*Food[\s\u00a0\u202f-]*Facts[^()]*?\(code[\s\u00a0\u202f]*(\d{6,})\))/gi
  return text.replace(pattern, (match, label, code) => {
    const href = buildOpenFoodFactsLink(code)
    if (!href) return match
    if (match.includes('](')) return match
    return `[${label}](${href})`
  })
}

function removeCitationMarks(text) {
  if (!text) return text
  return text.replace(CITATION_MARK_PATTERN, '')
}

export function enhanceAssistantContent(experience, content) {
  let output = content || ''
  if (!output) return output

  if (experience?.id === 'allergyfinder') {
    output = linkifyOpenFoodFactsMentions(output)
    output = removeCitationMarks(output)
  }

  return output.trim()
}
