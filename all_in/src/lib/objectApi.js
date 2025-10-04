const importMetaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined
const processEnv = typeof globalThis !== 'undefined' && globalThis.process?.env ? globalThis.process.env : undefined

function getEnvValue(key) {
  if (!key) return undefined
  if (importMetaEnv && importMetaEnv[key] !== undefined) return importMetaEnv[key]
  if (processEnv && processEnv[key] !== undefined) return processEnv[key]
  return undefined
}

const FALLBACK_BASE_URL = (getEnvValue('VITE_CHAT_BASE_URL') || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

function getStableUserId() {
  const envUser = (
    getEnvValue('VITE_OBJECTMAKER_USER') ||
    getEnvValue('VITE_CHAT_USER') ||
    getEnvValue('VITE_USER')
  )
  const s = (envUser || '').toString().trim()
  if (s) return s
  const key = 'allin_user_id'
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      let id = localStorage.getItem(key)
      if (id && id.trim()) return id.trim()
      id = `ui-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(key, id)
      return id
    }
  } catch (_) {
    // ignore storage errors and fall back to ephemeral id
  }
  return `ui-${Math.random().toString(36).slice(2, 10)}`
}

function preview(text = '', length = 160) {
  const t = (text || '').toString().trim()
  return t.length <= length ? t : `${t.slice(0, length)}...`
}

function normalizeResponseSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema
  try {
    const s = JSON.parse(JSON.stringify(schema))
    if (s.type === 'object') {
      const props = s.properties && typeof s.properties === 'object' ? s.properties : {}
      const keys = Object.keys(props)
      if (!('additionalProperties' in s)) s.additionalProperties = false
      const existingReq = Array.isArray(s.required) ? s.required.filter((k) => typeof k === 'string') : []
      const requiredSet = new Set([...existingReq, ...keys])
      s.required = Array.from(requiredSet)
    }
    return s
  } catch {
    return schema
  }
}

function normalizeType(raw) {
  const s = (raw || '').toString().trim()
  if (!s) return ''
  // Keep underscores, hyphens; collapse spaces to underscores
  return s
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .toLowerCase()
}

export async function createRemoteObject({ baseUrl, structure, model, objectType, prompt, system } = {}) {
  const base = (baseUrl || FALLBACK_BASE_URL || '').replace(/\/$/, '')
  if (!base) throw new Error('Missing service base URL for /obj')

  const envPath = (getEnvValue('VITE_OBJECTMAKER_OBJ_PATH') || '').trim()
  const type = normalizeType(objectType || (structure && structure.type))

  const substituteType = (pattern) => {
    if (!pattern) return null
    if (!type) return pattern.includes('{type}') || pattern.includes(':type') || pattern.includes('%s')
      ? null
      : pattern
    return pattern
      .replace('{type}', type)
      .replace(':type', type)
      .replace('%s', type)
  }

  let pathCandidates = []
  if (envPath) {
    const withType = substituteType(envPath)
    if (withType) pathCandidates.push(withType.startsWith('/') ? withType : `/${withType}`)
    else if (type) pathCandidates.push(envPath.replace(/\/?$/, '/') + type)
  }
  if (type) {
    pathCandidates.push(`/obj/${type}`, `/object/${type}`, `/objects/${type}`)
  }
  if (!type) {
    pathCandidates.push('/obj', '/object', '/objects')
  }

  // de-duplicate and ensure leading slash
  pathCandidates = Array.from(new Set(pathCandidates.filter(Boolean).map((p) => (p.startsWith('/') ? p : `/${p}`))))
  const p = (prompt || '').toString()
  const defaultSystem = `You are an object maker. Produce a single JSON object that strictly conforms to the provided JSON Schema. Do not include commentary or markdown. Only return the JSON object.`
  const sys = (system || defaultSystem).toString()
  const user = getStableUserId()
  const schema = normalizeResponseSchema(structure)
  const payloadBody = { schema, system: sys, user }
  if (p) payloadBody.prompt = p
  if (model) payloadBody.model = model
  const bodyCandidates = [payloadBody]

  let lastError = null
  for (const path of pathCandidates) {
    const url = `${base}${path}`
    let non404Error = null
    for (const body of bodyCandidates) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const raw = await res.text()
        if (!res.ok) {
          const msg = preview(raw)
          if (res.status === 404) {
            non404Error = null
            // trying more bodies won't fix a missing endpoint; move to next path
            break
          }
          // remember the last non-404 for this path and keep trying bodies
          non404Error = new Error(`HTTP ${res.status}: ${msg} (path ${url})`)
          continue
        }
        let payload
        try {
          payload = JSON.parse(raw)
        } catch {
          payload = null
        }
        if (!payload || typeof payload !== 'object') {
          throw new Error('Invalid JSON response from object endpoint')
        }
        return { payload, status: res.status, baseUrl: base, path }
      } catch (err) {
        non404Error = err
      }
    }
    if (non404Error) {
      throw non404Error
    }
    lastError = lastError || new Error(`HTTP 404: endpoint not found at ${url}`)
  }
  throw lastError || new Error('Object creation failed')
}
