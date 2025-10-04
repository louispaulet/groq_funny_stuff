import { useState } from 'react'
import { callRemoteChat } from '../lib/remoteChat'
import { extractFirstJson } from '../lib/jsonExtract'
import { addZooEntry } from '../lib/objectMakerStore'
import { createRemoteObject } from '../lib/objectApi'
import {
  DEFAULT_SYSTEM_PROMPT,
  DEFAULT_STRUCTURE,
  DEFAULT_STRUCTURE_TEXT,
  DEFAULT_OBJECT_PROMPT,
  DEFAULT_OBJECT_TYPE,
  DEFAULT_OBJECT_NAME,
} from '../lib/objectMakerDefaults'
import { buildMessages, normalizeBaseUrl, normalizeSchemaForUi } from '../lib/objectMakerUtils'

function resolveStructure(structureText, cachedStructure, setStructureObj) {
  if (cachedStructure) return cachedStructure
  const parsed = JSON.parse(structureText)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Structure must be a JSON object')
  }
  if (parsed.type !== 'object') {
    throw new Error('Schema must declare "type":"object"')
  }
  setStructureObj(parsed)
  return parsed
}

function normalizeAndStoreSchema(structure, setStructureObj, setStructureTextState, setStructureStatus, note) {
  const normalization = normalizeSchemaForUi(structure)
  if (!normalization.changed) {
    return normalization.schema
  }
  setStructureObj(normalization.schema)
  setStructureTextState(JSON.stringify(normalization.schema, null, 2))
  setStructureStatus(note)
  return normalization.schema
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

    const nextHistory = [...chatMessages, { role: 'user', content: trimmed, timestamp: Date.now() }]
    setChatMessages(nextHistory)
    setPrompt('')
    setChatLoading(true)

    try {
      const messages = buildMessages(nextHistory, experience?.systemPrompt)
      const res = await callRemoteChat(experience, messages, {
        model,
        baseUrl: normalizeBaseUrl(baseUrl),
      })
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
    const normalized = normalizeAndStoreSchema(
      obj,
      setStructureObj,
      setStructureTextState,
      setStructureStatus,
      'Schema adopted from assistant',
    )
    setStructureStatus('Schema adopted from assistant')
    setStructureTextState(JSON.stringify(normalized, null, 2))
    setStructureObj(normalized)
    setError('')
  }

  const validateStructure = () => {
    setError('')
    try {
      const parsed = JSON.parse(structureText)
      if (!parsed || typeof parsed !== 'object') throw new Error('Not an object')
      if (parsed.type !== 'object') throw new Error('Schema must declare "type":"object"')
      const normalized = normalizeSchemaForUi(parsed)
      setStructureObj(normalized.schema)
      if (normalized.changed) {
        setStructureTextState(JSON.stringify(normalized.schema, null, 2))
      }
      setStructureStatus(normalized.changed ? 'Schema valid (normalized unsupported keywords)' : 'Schema valid')
    } catch (e) {
      setStructureObj(null)
      setError(`Invalid JSON: ${e?.message || 'parse error'}`)
      setStructureStatus('')
    }
  }

  const handleCreate = async () => {
    setError('')
    setResultObj(null)

    let structure
    try {
      structure = resolveStructure(structureText, structureObj, setStructureObj)
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
    structure = normalizeAndStoreSchema(
      structure,
      setStructureObj,
      setStructureTextState,
      setStructureStatus,
      'Schema normalized before create (unsupported keywords removed)',
    )

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
