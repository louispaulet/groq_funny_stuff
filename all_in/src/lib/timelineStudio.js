export const TIMELINE_OBJECT_TYPE = 'narrative_timeline'

export const TIMELINE_RESPONSE_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    headline: { type: 'string' },
    summary: { type: 'string' },
    events: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          date: { type: 'string', description: 'ISO-8601 date or descriptive label' },
          title: { type: 'string' },
          description: { type: 'string' },
          icon: { type: 'string', description: 'Optional emoji representing the event' },
          location: { type: 'string' },
        },
        required: ['date', 'title', 'description'],
      },
    },
    cta: {
      type: 'object',
      additionalProperties: false,
      properties: {
        label: { type: 'string' },
        url: { type: 'string' },
      },
      required: ['label', 'url'],
    },
  },
  required: ['events'],
}

export const TIMELINE_SYSTEM_PROMPT = [
  'You are Chronicle, a timeline composer who returns richly written yet concise historical sequences as JSON.',
  'Always respond with an object that matches the provided JSON Schema exactly. Do not include markdown or commentary.',
  'Ensure the events array is in chronological order with clear, reader-friendly descriptions written in the third person.',
  'Whenever precise dates are known, use ISO-8601 format (YYYY-MM-DD). Otherwise provide a short descriptive label such as "Spring 2025".',
  'Keep titles punchy and no longer than 12 words. Descriptions should fit within 3 sentences.',
  'If a headline or summary is supplied in the schema, produce inspiring copy that frames the overall narrative.',
  'For optional CTA data, only include it when the request explicitly asks for more to explore.',
].join(' ')

export const TIMELINE_PRESET_SCENARIOS = [
  {
    id: 'mission-to-enceladus',
    label: '🛰️ Mission to Enceladus',
    prompt:
      'Plot the key mission milestones for a fictional 2032 expedition to Saturn\'s moon Enceladus focused on subsurface ocean research.',
  },
  {
    id: 'climate-startup',
    label: '🌱 Climate Startup Launch',
    prompt:
      'Outline the first three years for a climate-tech startup that designs modular direct air capture units for dense urban rooftops.',
  },
  {
    id: 'museum-exhibit',
    label: '🖼️ Museum Exhibit',
    prompt:
      'Design a timeline for an immersive museum exhibit celebrating 150 years of urban public transportation innovations.',
  },
  {
    id: 'esports-league',
    label: '🎮 Esports League Season',
    prompt:
      'Draft the inaugural season timeline for a global collegiate esports league, from preseason to championship celebrations.',
  },
  {
    id: 'wellness-retreat',
    label: '🌄 Wellness Retreat Journey',
    prompt:
      'Map a six-month transformation program at a mountain wellness retreat that blends mindfulness, nutrition, and community projects.',
  },
  {
    id: 'michelin-star-menu',
    label: '⭐ Michelin star menu',
    prompt:
      'Design a Michelin starred 7 course meal menu, give me a detailed descriptions of each of the 7 courses. The timeline is during the course of a 3h meal on a single day, at an optimal pace for maximal enjoyment.',
  },
]

export function buildTimelinePrompt(request) {
  const trimmed = (request || '').trim()
  const lines = [
    'Create a beautifully structured narrative timeline that can be rendered in a scrolling interface.',
    'Follow these rules:',
    '- Include at least six meaningful events ordered chronologically.',
    '- Each event must provide a vivid description of what happens and why it matters.',
    '- Highlight momentum, transitions, and outcomes that invite the reader to keep scrolling.',
    '- Use inclusive, inspiring language and avoid first-person narration.',
    '- Add a headline and summary that frame the story when appropriate.',
    '',
    'Request:',
    trimmed || 'Surprise the reader with an uplifting timeline.',
  ]

  return lines.join('\n')
}
