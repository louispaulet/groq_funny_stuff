import { useMemo, useState } from 'react'
import { callRemoteChat } from '../lib/remoteChat'
import { extractFirstJson } from '../lib/jsonExtract'
import { addZooEntry } from '../lib/objectMakerStore'
import { createRemoteObject } from '../lib/objectApi'
import { getExperienceById } from '../config/experiences'
import { Link } from 'react-router-dom'
import Settings from '../components/objectmaker/Settings'
import Assist from '../components/objectmaker/Assist'
import Editor from '../components/objectmaker/Editor'

// UI subcomponents moved to components/objectmaker/*

export default function ObjectMakerBuilder() {
  const experience = getExperienceById('objectmaker')
  const [model, setModel] = useState(experience?.defaultModel || experience?.modelOptions?.[0])
  const [baseUrl, setBaseUrl] = useState((experience?.defaultBaseUrl || '').replace(/\/$/, ''))

  const [prompt, setPrompt] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState([])

  const [structureText, setStructureText] = useState('')
  const [structureObj, setStructureObj] = useState(null)
  const [createLoading, setCreateLoading] = useState(false)
  const [resultObj, setResultObj] = useState(null)
  const [objectType, setObjectType] = useState('')
  const [objectTitle, setObjectTitle] = useState('')
  const [createPrompt, setCreatePrompt] = useState('')
  const [systemText, setSystemText] = useState('')
  const [error, setError] = useState('')

  function normalizeBaseUrl(raw) {
    const candidate = (raw || '').trim()
    if (!candidate) return ''
    return candidate.replace(/\/$/, '')
  }

  function buildMessages(history) {
    const sys = experience?.systemPrompt
    const base = sys ? [{ role: 'system', content: sys }] : []
    const turns = (history || [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: m.content }))
    return [...base, ...turns]
  }

  async function sendToChat() {
    const trimmed = prompt.trim()
    if (!trimmed || chatLoading) return
    setError('')
    const user = { role: 'user', content: trimmed, timestamp: Date.now() }
    const nextHistory = [...chatMessages, user]
    setChatMessages(nextHistory)
    setPrompt('')
    setChatLoading(true)
    try {
      const res = await callRemoteChat(
        experience,
        buildMessages(nextHistory),
        { model, baseUrl }
      )
      const assistant = { role: 'assistant', content: res.content, timestamp: Date.now() }
      setChatMessages((prev) => [...prev, assistant])
    } catch (err) {
      setError(err?.message || 'Chat failed')
    } finally {
      setChatLoading(false)
    }
  }

  function tryAdoptAssistantJson() {
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
    try {
      const pretty = JSON.stringify(obj, null, 2)
      setStructureText(pretty)
      if (obj?.type !== 'object') {
        setStructureObj(null)
        setError('Schema must declare "type":"object".')
      } else {
        setStructureObj(obj)
        setError('')
      }
    } catch {
      setError('Failed to format extracted JSON')
    }
  }

  function validateStructure() {
    setError('')
    try {
      const parsed = JSON.parse(structureText)
      if (!parsed || typeof parsed !== 'object') throw new Error('Not an object')
      setStructureObj(parsed)
    } catch (e) {
      setStructureObj(null)
      setError(`Invalid JSON: ${e?.message || 'parse error'}`)
    }
  }

  async function handleCreate() {
    setError('')
    setResultObj(null)
    let structure
    try {
      structure = structureObj || JSON.parse(structureText)
      if (!structure || typeof structure !== 'object') throw new Error('Structure must be a JSON object')
      if (structure.type !== 'object') throw new Error('Schema must declare "type":"object"')
    } catch (e) {
      setError(`Invalid structure: ${e?.message || 'parse error'}`)
      return
    }

    setCreateLoading(true)
    const effectiveType = (objectType || (structure && structure.type) || '').toString().trim()
    if (!effectiveType) {
      setError('Type is required to call /obj/{type}. Fill the Type field or include "type" in your structure.')
      return
    }

    try {
      const { payload } = await createRemoteObject({ baseUrl, structure, model, objectType: effectiveType, prompt: createPrompt, system: systemText })
      setResultObj(payload)
      const derivedType = (effectiveType || payload?.type || structure?.type || 'object').toString()
      const title = (objectTitle || payload?.name || payload?.title || derivedType).toString()
      const entry = {
        id: `obj-${Date.now().toString(16)}`,
        type: derivedType,
        title,
        createdAt: Date.now(),
        structure,
        result: payload,
        conversation: chatMessages,
        prompt: createPrompt,
      }
      addZooEntry(entry)
    } catch (e) {
      setError(e?.message || 'Object creation failed')
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-12">
        <Settings baseUrl={baseUrl} setBaseUrl={setBaseUrl} model={model} setModel={setModel} experience={experience} objectType={objectType} />
        <Assist
          prompt={prompt}
          setPrompt={setPrompt}
          chatMessages={chatMessages}
          chatLoading={chatLoading}
          onSend={sendToChat}
          onAdopt={tryAdoptAssistantJson}
        />
        <Editor
          structureText={structureText}
          setStructureText={setStructureText}
          onValidate={validateStructure}
          objectType={objectType}
          setObjectType={setObjectType}
          objectTitle={objectTitle}
          setObjectTitle={setObjectTitle}
        createPrompt={createPrompt}
        setCreatePrompt={setCreatePrompt}
        systemText={systemText}
        setSystemText={setSystemText}
        onCreate={handleCreate}
          createLoading={createLoading}
          error={error}
          resultObj={resultObj}
        />
      </div>
    </div>
  )
}
