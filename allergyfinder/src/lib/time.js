export function formatTime(ts) {
  const d = typeof ts === 'number' ? new Date(ts) : ts
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

