import { useState } from 'react'
import { callRemoteChat } from '../lib/remoteChat'
import { extractFirstJson } from '../lib/jsonExtract'
import { addZooEntry } from '../lib/objectMakerStore'
import { createRemoteObject } from '../lib/objectApi'

export const DEFAULT_SYSTEM_PROMPT = 'You are an object maker. Produce a single JSON object that strictly conforms to the provided JSON Schema. Do not include commentary or markdown. Only return the JSON object.'

export const DEFAULT_STRUCTURE = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    size: { type: 'string', enum: ['small', 'medium', 'large'] },
    crust: { type: 'string' },
    cheese: { type: 'string' },
    toppings: { type: 'array', items: { type: 'string' } },
  },
  required: ['name', 'size', 'crust', 'cheese', 'toppings'],
}

export const DEFAULT_STRUCTURE_TEXT = JSON.stringify(DEFAULT_STRUCTURE, null, 2)
export const DEFAULT_OBJECT_PROMPT = 'make a delicious spicy pizza that respects this schema'
export const DEFAULT_OBJECT_TYPE = 'pizza'
export const DEFAULT_OBJECT_NAME = ''

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

export function useObjectMakerBuilderState(experience) {
  const [model, setModel] = useState(experience?.defaultModel || experience?.modelOptions?.[0])
  const [baseUrl, setBaseUrl] = useState(normalizeBaseUrl(experience?.defaultBaseUrl))
  const [prompt, setPrompt] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [structureText, setStructureTextState] = useState(DEFAULT_STRUCTURE_TEXT)
  const [structureObj, setStructureObj] = useState(DEFAULT_STRUCTURE)
  const [structureStatus, setStructureStatus] = useState('')
  const [createLoading, setCreateLoading] = useState(false)
  const [resultObj, setResultObj] = useState(null)
  const [objectType, setObjectType] = useState(DEFAULT_OBJECT_TYPE)
  const [objectName, setObjectName] = useState(DEFAULT_OBJECT_NAME)
  const [createPrompt, setCreatePrompt] = useState(DEFAULT_OBJECT_PROMPT)
  const [systemText, setSystemText] = useState(DEFAULT_SYSTEM_PROMPT)
  const [temperature, setTemperature] = useState('0')
  const [strictMode, setStrictMode] = useState('auto')
  const [error, setError] = useState('')

  const setStructureText = (value) => {
    setStructureTextState(value)
    setStructureObj(null)
    setStructureStatus('')
  }

  const updateBaseUrl = (value) => setBaseUrl(value)

  const sendToChat = async () => {
    const trimmed = prompt.trim()
    if (!trimmed || chatLoading) return
    setError('')
    const user = { role: 'user', content: trimmed, timestamp: Date.now() }
    const nextHistory = [...chatMessages, user]
    setChatMessages(nextHistory)
    setPrompt('')
    setChatLoading(true)
    try {
      const messages = buildMessages(nextHistory, experience?.systemPrompt)
      const res = await callRemoteChat(experience, messages, { model, baseUrl: normalizeBaseUrl(baseUrl) })
      const assistant = { role: 'assistant', content: res.content, timestamp: Date.now() }
      setChatMessages((prev) => [...prev, assistant])
    } catch (err) {
      setError(err?.message || 'Chat failed')
    } finally {
      setChatLoading(false)
    }
  }

  const tryAdoptAssistantJson = () => {
    const last = [...chatMessages].reverse().find((m) => m.role === 'assistant')
    if (!last) {
      setError('No assistant message to extract JSON from.')
      return
    }
    const obj = extractFirstJson(last.content)
    if (!obj) {
      setError('Could not extract JSON. Ensure the assistant returns a single JSON object.')
      return
    }
    if (obj?.type !== 'object') {
      setError('Schema must declare "type":"object".')
      return
    }
    const { schema: normalized } = normalizeSchemaForUi(obj)
    setStructureTextState(JSON.stringify(normalized, null, 2))
    setStructureObj(normalized)
    setStructureStatus('Schema adopted from assistant')
    setError('')
  }

  const validateStructure = () => {
    setError('')
    try {
      const parsed = JSON.parse(structureText)
      if (!parsed || typeof parsed !== 'object') throw new Error('Not an object')
      if (parsed.type !== 'object') throw new Error('Schema must declare "type":"object"')
      const normalization = normalizeSchemaForUi(parsed)
      setStructureObj(normalization.schema)
      if (normalization.changed) {
        setStructureTextState(JSON.stringify(normalization.schema, null, 2))
      }
      setStructureStatus(normalization.changed ? 'Schema valid (normalized unsupported keywords)' : 'Schema valid')
    } catch (e) {
      setStructureObj(null)
      setError(`Invalid JSON: ${e?.message || 'parse error'}`)
      setStructureStatus('')
    }
  }

  const resolveStructure = () => {
    if (structureObj) return structureObj
    try {
      const parsed = JSON.parse(structureText)
      if (!parsed || typeof parsed !== 'object') throw new Error('Structure must be a JSON object')
      if (parsed.type !== 'object') throw new Error('Schema must declare "type":"object"')
      setStructureObj(parsed)
      return parsed
    } catch (e) {
      throw new Error(`Invalid structure: ${e?.message || 'parse error'}`)
    }
  }

  const handleCreate = async () => {
    setError('')
    setResultObj(null)

    let structure
    try {
      structure = resolveStructure()
    } catch (err) {
      setError(err.message)
      return
    }

    const effectiveType = (objectType || structure?.type || '').toString().trim()
    if (!effectiveType) {
      setError('Type is required to call /obj/{type}. Fill the Type field or include "type" in your structure.')
      return
    }

    const promptText = createPrompt.trim()
    if (!promptText) {
      setError('Provide a user prompt for the object generation request.')
      return
    }

    const systemTextValue = systemText.trim() || DEFAULT_SYSTEM_PROMPT

    const normalization = normalizeSchemaForUi(structure)
    structure = normalization.schema
    if (normalization.changed) {
      setStructureObj(structure)
      setStructureTextState(JSON.stringify(structure, null, 2))
      setStructureStatus('Schema normalized before create (unsupported keywords removed)')
    }

    setCreateLoading(true)
    try {
      const targetBaseUrl = normalizeBaseUrl(baseUrl)
      const temperatureNumber = Number.parseFloat(temperature)
      const strictValue =
        strictMode === 'true' ? true : strictMode === 'false' ? false : undefined
      const { payload } = await createRemoteObject({
        baseUrl: targetBaseUrl,
        structure,
        model,
        objectType: effectiveType,
        prompt: promptText,
        system: systemTextValue,
        temperature: Number.isFinite(temperatureNumber) ? temperatureNumber : undefined,
        strict: strictValue,
      })
      setResultObj(payload)
      const derivedType = (effectiveType || payload?.type || structure?.type || 'object').toString()
      const derivedTitle = (payload?.name || objectName || payload?.title || derivedType).toString()
      addZooEntry({
        id: `obj-${Date.now().toString(16)}`,
        type: derivedType,
        title: derivedTitle,
        createdAt: Date.now(),
        structure,
        result: payload,
        conversation: chatMessages,
        prompt: promptText,
        system: systemTextValue,
        temperature: Number.isFinite(temperatureNumber) ? temperatureNumber : undefined,
        strict: strictValue,
      })
    } catch (err) {
      setError(err?.message || 'Object creation failed')
    } finally {
      setCreateLoading(false)
    }
  }

  return {
    experience,
    model,
    setModel,
    baseUrl,
    setBaseUrl: updateBaseUrl,
    prompt,
    setPrompt,
    chatLoading,
    chatMessages,
    sendToChat,
    tryAdoptAssistantJson,
    structureText,
    setStructureText,
    validateStructure,
    structureStatus,
    objectType,
    setObjectType,
    objectName,
    setObjectName,
    createPrompt,
    setCreatePrompt,
    systemText,
    setSystemText,
    temperature,
    setTemperature,
    strictMode,
    setStrictMode,
    handleCreate,
    createLoading,
    error,
    resultObj,
  }
}
