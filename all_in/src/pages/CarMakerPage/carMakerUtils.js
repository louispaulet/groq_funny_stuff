export function initializeDetailSelections(detailOptions) {
  return detailOptions.reduce(
    (accumulator, option) => ({
      ...accumulator,
      [option.id]: {
        enabled: ['aero-kit', 'graphic'].includes(option.id),
        intensity: 'balanced',
      },
    }),
    {},
  )
}

export function createTemplatePayload({
  brand,
  color,
  wheelCount,
  bodyStyle,
  carType,
  finish,
  viewpoint,
  scenery,
  lighting,
  detailSelections,
  finishingNotes,
  detailOptions,
}) {
  const details = detailOptions
    .filter((option) => detailSelections[option.id]?.enabled)
    .map((option) => `- ${option.label}: ${detailSelections[option.id].intensity}`)

  return [
    'Craft a vivid yet concise AI image prompt for an automotive exterior photoshoot.',
    'Describe only the visible design, stance, setting, and lighting—avoid mechanical specifications or interior commentary.',
    'Respond with one paragraph under 80 words and do not use lists or line breaks.',
    '',
    'Car configuration:',
    `• Brand: ${brand}`,
    `• Exterior color: ${color || 'unspecified'}`,
    `• Wheel count: ${wheelCount || 'unspecified'}`,
    `• Body style: ${bodyStyle}`,
    `• Car type: ${carType}`,
    `• Finish: ${finish}`,
    details.length > 0 ? '• Distinctive details:\n' + details.join('\n') : '• Distinctive details: none',
    `• Viewpoint: ${viewpoint}`,
    `• Scenery: ${scenery}`,
    `• Lighting: ${lighting}`,
    finishingNotes ? `• Extra direction: ${finishingNotes}` : '• Extra direction: none',
  ]
    .filter(Boolean)
    .join('\n')
}

export function summarizeConfiguration({
  brand,
  color,
  wheelCount,
  bodyStyle,
  carType,
  finish,
  viewpoint,
  scenery,
  lighting,
  detailSelections,
  finishingNotes,
  detailOptions,
}) {
  const enabledDetails = detailOptions.filter((option) => detailSelections[option.id]?.enabled)
  const detailsSummary =
    enabledDetails.length > 0
      ? enabledDetails
          .map((option) => `${option.label.toLowerCase()} (${detailSelections[option.id].intensity})`)
          .join(', ')
      : 'no extra flourishes'

  const wheelsLabel = (() => {
    if (typeof wheelCount === 'number') {
      return Number.isFinite(wheelCount) ? `${wheelCount}-wheel` : 'custom-wheel'
    }
    const trimmed = typeof wheelCount === 'string' ? wheelCount.trim() : ''
    return trimmed ? `${trimmed}-wheel` : 'custom-wheel'
  })()

  return [
    `A ${brand} ${bodyStyle} portrayed as a ${carType}`,
    `finished in ${color || 'a custom hue'} with ${finish}`,
    `shown from a ${viewpoint} in ${scenery}`,
    `under ${lighting}, featuring ${detailsSummary}`,
    finishingNotes ? `extra direction: ${finishingNotes}` : null,
    `wheel setup: ${wheelsLabel}`,
  ]
    .filter(Boolean)
    .join(', ')
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
