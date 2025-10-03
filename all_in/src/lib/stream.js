export function extractDeltaText(payload) {
  if (typeof payload === 'string') return payload
  if (!payload) return ''
  if (typeof payload.delta === 'string') return payload.delta
  if (typeof payload.text === 'string') return payload.text
  if (typeof payload.data === 'string') return payload.data
  if (typeof payload.value === 'string') return payload.value
  return ''
}
