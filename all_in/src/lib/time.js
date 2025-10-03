export function formatTime(ts) {
  const date = typeof ts === 'number' ? new Date(ts) : ts
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
