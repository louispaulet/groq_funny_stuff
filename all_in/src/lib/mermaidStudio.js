import DOMPurify from 'dompurify'

const SANITIZER_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },
  ADD_TAGS: ['foreignObject', 'div', 'span', 'p', 'style', 'br', 'switch', 'tspan'],
  ADD_ATTR: [
    'class',
    'style',
    'id',
    'data-background',
    'data-mermaid-enhanced',
    'data-mermaid-text-style',
    'dominant-baseline',
    'alignment-baseline',
    'baseline-shift',
    'text-anchor',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'marker-start',
    'marker-mid',
    'marker-end',
    'transform',
    'fill',
    'stroke',
    'stroke-width',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-dasharray',
    'stroke-dashoffset',
    'opacity',
    'viewBox',
    'width',
    'height',
    'x',
    'y',
    'dx',
    'dy',
    'rx',
    'ry',
    'cx',
    'cy',
    'r',
    'd',
    'points',
    'xmlns',
    'xmlns:xlink',
    'xml:space',
    'xlink:href',
  ],
  KEEP_CONTENT: true,
}

const MERMAID_TEXT_STYLE = `<style data-mermaid-text-style>
[data-mermaid-enhanced="true"] .nodeLabel,
[data-mermaid-enhanced="true"] .label,
[data-mermaid-enhanced="true"] foreignObject div {
  color: #1f2937 !important;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.35;
}
[data-mermaid-enhanced="true"] .edgeLabel,
[data-mermaid-enhanced="true"] .edgeLabel tspan {
  fill: #1f2937 !important;
  color: #1f2937 !important;
  font-size: 13px;
  font-weight: 500;
  text-shadow: 0 1px 1px rgba(15, 23, 42, 0.08);
}
[data-mermaid-enhanced="true"] .edgeLabel rect {
  fill: rgba(226, 232, 240, 0.95);
  stroke: rgba(148, 163, 184, 0.65);
  stroke-width: 0.6;
}
[data-mermaid-enhanced="true"] .label text,
[data-mermaid-enhanced="true"] .nodeLabel text {
  fill: #1f2937 !important;
}
[data-mermaid-enhanced="true"] .label foreignObject {
  overflow: visible;
}
</style>`

export const MERMAID_RESPONSE_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      description: 'Short label for the generated diagram.',
    },
    mermaid: {
      type: 'string',
      description: 'Valid Mermaid definition (no code fences).',
    },
    notes: {
      type: 'string',
      description: 'Optional summary or assumptions about the diagram.',
    },
  },
  required: ['mermaid'],
}

export const MERMAID_OBJECT_TYPE = 'mermaid_blueprint'

export const MERMAID_SYSTEM_PROMPT = [
  'You are a diagram director who produces Mermaid.js diagrams from natural language briefs.',
  'Return a JSON object that follows the provided schema.',
  'The "mermaid" field must contain a valid Mermaid definition that renders in Mermaid v10 without modifications. Do not include code fences or commentary.',
  'Choose the most appropriate diagram style (flowchart, sequence, class, timeline, mindmap, etc.) for the request and use concise, descriptive labels.',
  'Keep identifiers syntax-safe and prefer multi-line layouts when relationships need clarity.',
  'Capture any assumptions or guidance for the user in the optional "notes" field (keep it under 100 words).',
  'Every node must include a clear, human-readable label that names the entity (such as a character or system component).',
  'Provide short edge labels (e.g., “mentors”, “reports to”) whenever it clarifies the relationship between nodes.',
].join(' ')

export function buildPreviewMarkup(svgMarkup) {
  if (typeof window === 'undefined') return ''
  if (typeof svgMarkup !== 'string') return ''
  const trimmed = svgMarkup.trim()
  if (!trimmed) return ''
  return DOMPurify.sanitize(trimmed, SANITIZER_CONFIG)
}

export function buildObjectPrompt(userPrompt) {
  return [
    'Create a Mermaid.js diagram that satisfies the following request.',
    'Respond with a JSON object matching the provided schema.',
    'Use newline characters to format the diagram for readability.',
    '',
    'User brief:',
    userPrompt,
  ].join('\n')
}

export function decorateMermaidSvg(svgMarkup) {
  if (typeof svgMarkup !== 'string' || !svgMarkup.trim()) return ''
  let enhanced = svgMarkup
  if (!enhanced.includes('data-mermaid-enhanced')) {
    enhanced = enhanced.replace(/<svg\b/, (match) => `${match} data-mermaid-enhanced="true"`)
  }
  if (!enhanced.includes('data-mermaid-text-style')) {
    enhanced = enhanced.replace(/<svg\b[^>]*>/, (match) => `${match}${MERMAID_TEXT_STYLE}`)
  }
  return enhanced
}
