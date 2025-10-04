import { useEffect, useMemo, useRef, useState } from 'react'
import { DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

function TextArea({ value, onChange, rows = 10, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      spellCheck={false}
      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white/90 p-2 font-mono text-[13px] text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
      placeholder={placeholder}
    />
  )
}

function JsonBlock({ value }) {
  const content = useMemo(() => {
    try { return JSON.stringify(value, null, 2) } catch { return '' }
  }, [value])
  return (
    <pre className="max-h-80 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200">{content}</pre>
  )
}

export default function Editor({
  structureText,
  setStructureText,
  onValidate,
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
  onCreate,
  createLoading,
  error,
  resultObj,
  structureStatus,
}) {
  const [copyFeedback, setCopyFeedback] = useState('')
  const copyTimeout = useRef(null)

  useEffect(() => () => {
    if (copyTimeout.current) {
      clearTimeout(copyTimeout.current)
      copyTimeout.current = null
    }
  }, [])

  async function handleCopy() {
    if (!resultObj) return
    try {
      const text = JSON.stringify(resultObj, null, 2)
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const temp = document.createElement('textarea')
        temp.value = text
        temp.setAttribute('readonly', '')
        temp.style.position = 'absolute'
        temp.style.left = '-9999px'
        document.body.appendChild(temp)
        temp.select()
        document.execCommand('copy')
        document.body.removeChild(temp)
      }
      setCopyFeedback('Copied!')
    } catch (err) {
      console.error('Copy failed', err)
      setCopyFeedback('Copy failed')
    }
    if (copyTimeout.current) clearTimeout(copyTimeout.current)
    copyTimeout.current = setTimeout(() => {
      setCopyFeedback('')
      copyTimeout.current = null
    }, 2000)
  }

  return (
    <section className="md:col-span-7 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Schema Setup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Define and validate the JSON Schema before attempting generation.</p>
          </div>
          {structureStatus ? (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
              <span>{structureStatus}</span>
            </div>
          ) : null}
        </div>
        <div className="mt-3 space-y-3">
          <TextArea
            value={structureText}
            onChange={setStructureText}
            rows={16}
            placeholder='{"type":"object","properties":{"name":{"type":"string"},"toppings":{"type":"array","items":{"type":"string"}}}}'
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onValidate}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-amber-500"
            >
              Validate JSON
            </button>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              <span className="mr-1">Type</span>
              <input
                value={objectType}
                onChange={(e) => setObjectType(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="pizza | hot_sauce | car"
              />
            </label>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              <span className="mr-1">Object Name (optional)</span>
              <input
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="diavola"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mr-1 text-slate-600 dark:text-slate-300">System Instruction</span>
            <input
              value={systemText}
              onChange={(e) => setSystemText(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="You create a pizza object that conforms strictly to the provided JSON Schema; return only JSON."
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Generation Request</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Craft the prompt and run the request after your schema looks right.</p>
          </div>
          <label className="block text-sm">
            <span className="mr-1 text-slate-600 dark:text-slate-300">User Prompt</span>
            <input
              value={createPrompt}
              onChange={(e) => setCreatePrompt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Describe the instance to create (e.g., 'A Margherita with basil and fresh mozzarella')"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              <span className="mr-1">Temperature</span>
              <input
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                min="0"
                max="2"
                step="0.1"
                className="mt-1 block w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </label>
            <label className="text-sm text-slate-600 dark:text-slate-300">
              <span className="mr-1">Strict mode</span>
              <select
                value={strictMode}
                onChange={(e) => setStrictMode(e.target.value)}
                className="mt-1 block rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="auto">Auto (service decides)</option>
                <option value="true">Force strict validation</option>
                <option value="false">Relaxed validation</option>
              </select>
            </label>
            <div className="ml-auto flex items-end">
              <button
                type="button"
                onClick={onCreate}
                disabled={createLoading}
                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-50"
              >
                {createLoading ? 'Creating…' : 'Create Object'}
              </button>
            </div>
          </div>
          {error ? (
            <div className="rounded-md border border-red-300 bg-red-50 p-2 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-900/40 dark:text-red-200">{error}</div>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white/60 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Last Created Object</h3>
          {resultObj ? (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {copyFeedback ? <span>{copyFeedback}</span> : null}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <DocumentDuplicateIcon className="h-4 w-4" aria-hidden="true" />
                Copy JSON
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-3">
          {resultObj ? <JsonBlock value={resultObj} /> : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white/60 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
              No object created yet. The response from /obj will appear here.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}
