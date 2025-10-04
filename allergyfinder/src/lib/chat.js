export function buildPromptFromMessages(messages, context) {
  const header = [
    'You are an allergy assistant that uses OpenFoodFacts data to answer questions about food allergens.',
    'Use the provided context when it is relevant and be transparent about any gaps.',
    'When a barcode or OpenFoodFacts code is available, share the product page URL in the form https://fr.openfoodfacts.org/produit/<code> (substitute the numeric code).',
    'Encourage users to double-check packaging for medical decisions.'
  ].join(' ')
  const contextBlock = context?.trim()
    ? `\n\nOpenFoodFacts context:\n${context.trim()}`
    : ''
  const convo = (messages || [])
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')
  return `${header}${contextBlock}\n\n${convo}\nAssistant:`
}
