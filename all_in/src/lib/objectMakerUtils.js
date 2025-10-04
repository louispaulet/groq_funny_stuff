function buildMessages(history, systemPrompt) {
  const sys = systemPrompt ? [{ role: 'system', content: systemPrompt }] : []
  const turns = (history || [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: m.content }))
  return [...sys, ...turns]
}

function normalizeBaseUrl(raw) {
  const candidate = (raw || '').trim()
  if (!candidate) return ''
  return candidate.replace(/\/$/, '')
}

function normalizeSchemaForUi(schema) {
  if (!schema || typeof schema !== 'object') {
    return { schema, changed: false }
  }

  let changed = false
  const clone = JSON.parse(JSON.stringify(schema))

  const visit = (node) => {
    if (!node || typeof node !== 'object') return

    if (node.type === 'object') {
      if (node.additionalProperties !== false) {
        node.additionalProperties = false
        changed = true
      }
      const props = node.properties && typeof node.properties === 'object' ? node.properties : {}
      const propKeys = Object.keys(props)
      if (propKeys.length) {
        const existing = Array.isArray(node.required) ? node.required.filter((key) => typeof key === 'string') : []
        const set = new Set(existing)
        const beforeSize = set.size
        for (const key of propKeys) set.add(key)
        if (set.size !== beforeSize || existing.length !== set.size) {
          node.required = Array.from(set)
          changed = true
        }
      }
      Object.values(props).forEach(visit)

      const patternProps = node.patternProperties && typeof node.patternProperties === 'object' ? node.patternProperties : {}
      Object.values(patternProps).forEach(visit)

      const deps = node.dependencies && typeof node.dependencies === 'object' ? node.dependencies : {}
      Object.values(deps).forEach((value) => {
        if (value && typeof value === 'object') visit(value)
      })
    }

    if ('format' in node) {
      delete node.format
      changed = true
    }

    if (node.items) {
      if (Array.isArray(node.items)) node.items.forEach(visit)
      else visit(node.items)
    }

    for (const key of ['allOf', 'anyOf', 'oneOf']) {
      if (Array.isArray(node[key])) node[key].forEach(visit)
    }

    for (const key of ['not', 'if', 'then', 'else']) {
      if (node[key] && typeof node[key] === 'object') visit(node[key])
    }

    for (const defsKey of ['definitions', '$defs']) {
      if (node[defsKey] && typeof node[defsKey] === 'object') {
        Object.values(node[defsKey]).forEach(visit)
      }
    }
  }

  visit(clone)
  return { schema: clone, changed }
}

export { buildMessages, normalizeBaseUrl, normalizeSchemaForUi }
