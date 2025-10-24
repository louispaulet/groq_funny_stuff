import { useEffect, useMemo, useRef, useState } from 'react'
import mermaid from 'mermaid'

import MermaidCanvas from '../components/mermaid/MermaidCanvas'
import MermaidGallery from '../components/mermaid/MermaidGallery'
import MermaidPromptForm from '../components/mermaid/MermaidPromptForm'
import MermaidSourcePanel from '../components/mermaid/MermaidSourcePanel'
import { createRemoteObject } from '../lib/objectApi'
import { normalizeBaseUrl } from '../lib/objectMakerUtils'
import { appendMermaidHistoryEntry, clearMermaidHistory, readMermaidHistory } from '../lib/mermaidHistoryCookie'
import {
  MERMAID_OBJECT_TYPE,
  MERMAID_RESPONSE_STRUCTURE,
  MERMAID_SYSTEM_PROMPT,
  buildObjectPrompt,
  buildPreviewMarkup,
  decorateMermaidSvg,
} from '../lib/mermaidStudio'

export default function MermaidStudioPage({ experience }) {
  const [prompt, setPrompt] = useState('Show the interactions of The Office characters.')
  const [diagram, setDiagram] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState(null)
  const [rendering, setRendering] = useState(false)
  const [copied, setCopied] = useState(false)

  const renderCounter = useRef(0)

  const normalizedBaseUrl = normalizeBaseUrl(experience?.defaultBaseUrl)
  const model = experience?.defaultModel || experience?.modelOptions?.[0] || ''

  useEffect(() => {
    if (typeof window === 'undefined') return
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'neutral',
      flowchart: { useMaxWidth: false, htmlLabels: false, curve: 'basis' },
      themeVariables: {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '15px',
        textColor: '#1f2937',
        primaryTextColor: '#1f2937',
        secondaryTextColor: '#1f2937',
        nodeTextColor: '#1f2937',
        labelTextColor: '#1f2937',
        primaryColor: '#f8fafc',
        secondaryColor: '#e2e8f0',
        tertiaryColor: '#cbd5f5',
        lineColor: '#64748b',
        edgeLabelBackground: '#e2e8f0',
        edgeLabelTextColor: '#1f2937',
      },
    })
  }, [])

  useEffect(() => {
    setHistory(readMermaidHistory())
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(timer)
  }, [copied])

  const sanitizedDiagram = useMemo(() => buildPreviewMarkup(diagram?.svgMarkup || ''), [diagram?.svgMarkup])
  const mermaidSource = diagram?.mermaidSource || ''
  const diagramTitle = diagram?.title || ''
  const diagramNotes = diagram?.notes || ''

  const handlePromptChange = (nextPrompt) => {
    setPrompt(nextPrompt)
    setStatus((current) => (current?.type === 'error' ? null : current))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setStatus({ type: 'error', message: 'Describe the diagram you want before calling /obj.' })
      return
    }

    if (typeof window === 'undefined') {
      setStatus({ type: 'error', message: 'Mermaid is not available in this environment.' })
      return
    }

    const previousDiagram = diagram
    const promptChanged = previousDiagram && previousDiagram.prompt !== trimmedPrompt
    if (promptChanged) {
      setDiagram(null)
    }

    setRendering(true)
    setCopied(false)
    setStatus({ type: 'info', message: 'Drafting Mermaid markup via /obj…' })

    let mermaidText = ''
    let title = ''
    let notes = ''

    try {
      const { payload } = await createRemoteObject({
        baseUrl: normalizedBaseUrl || undefined,
        structure: MERMAID_RESPONSE_STRUCTURE,
        objectType: MERMAID_OBJECT_TYPE,
        prompt: buildObjectPrompt(trimmedPrompt),
        system: MERMAID_SYSTEM_PROMPT,
        strict: true,
        model: model || undefined,
      })

      mermaidText = typeof payload?.mermaid === 'string' ? payload.mermaid.trim() : ''
      title = typeof payload?.title === 'string' ? payload.title.trim() : ''
      notes = typeof payload?.notes === 'string' ? payload.notes.trim() : ''

      if (!mermaidText) {
        throw new Error('Mermaid diagram missing from /obj response.')
      }

      renderCounter.current += 1
      const renderId = `mermaid-diagram-${renderCounter.current}`
      const { svg } = await mermaid.render(renderId, mermaidText)
      const decoratedSvg = decorateMermaidSvg(svg)

      if (promptChanged && previousDiagram) {
        const nextHistory = appendMermaidHistoryEntry(previousDiagram)
        setHistory(nextHistory)
      }

      setDiagram({
        prompt: trimmedPrompt,
        mermaidSource: mermaidText,
        svgMarkup: decoratedSvg,
        title,
        notes,
      })
      setStatus({
        type: 'success',
        message: 'Mermaid diagram generated via /obj. Copy the source or iterate with another brief.',
      })
    } catch (error) {
      const baseMessage =
        error && typeof error.message === 'string'
          ? error.message
          : 'Mermaid generation failed. Please try a different description.'
      if (mermaidText) {
        setDiagram({
          prompt: trimmedPrompt,
          mermaidSource: mermaidText,
          svgMarkup: '',
          title,
          notes,
        })
        setStatus({
          type: 'error',
          message: `Mermaid render failed: ${baseMessage}. Copy the generated source below or adjust your prompt.`,
        })
      } else {
        if (promptChanged && previousDiagram) {
          setDiagram(previousDiagram)
        }
        setStatus({ type: 'error', message: baseMessage })
      }
    } finally {
      setRendering(false)
    }
  }

  function handleCopySource() {
    if (!mermaidSource) return
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(mermaidSource)
        .then(() => setCopied(true))
        .catch(() => {
          setStatus({
            type: 'error',
            message: 'Copy failed. Select the Mermaid source manually instead.',
          })
        })
    } else {
      setStatus({
        type: 'error',
        message: 'Clipboard API unavailable. Select the Mermaid source manually instead.',
      })
    }
  }

  function handleClearCurrent() {
    setDiagram(null)
    setPrompt('')
    setStatus({ type: 'info', message: 'Cleared the current brief and diagram. Your gallery remains intact.' })
    setCopied(false)
  }

  function handleSelectHistory(entry) {
    if (!entry) return
    setPrompt(entry.prompt || '')
    setDiagram({
      prompt: entry.prompt || '',
      svgMarkup: entry.svgMarkup,
      mermaidSource: entry.mermaidSource || '',
      title: entry.title || '',
      notes: entry.notes || '',
    })
    setStatus({ type: 'info', message: 'Loaded a saved Mermaid render. Submit to regenerate it via /obj.' })
    setCopied(false)
  }

  function handleClearHistory() {
    clearMermaidHistory()
    setHistory([])
    setStatus({ type: 'info', message: 'Cleared the Mermaid gallery cookie for this browser.' })
  }

  function handleDismissStatus() {
    setStatus(null)
  }

  const promptPlaceholder =
    experience?.promptPlaceholder || 'Example: Show the interactions of The Office characters.'

  return (
    <div className="space-y-8">
      <MermaidPromptForm
        prompt={prompt}
        promptPlaceholder={promptPlaceholder}
        rendering={rendering}
        model={model}
        status={status}
        onPromptChange={handlePromptChange}
        onSubmit={handleSubmit}
        onClear={handleClearCurrent}
        onDismissStatus={handleDismissStatus}
      />
      <MermaidSourcePanel
        mermaidSource={mermaidSource}
        diagramTitle={diagramTitle}
        diagramNotes={diagramNotes}
        copied={copied}
        onCopy={handleCopySource}
      />
      <MermaidCanvas
        diagramTitle={diagramTitle}
        diagramPrompt={diagram?.prompt}
        sanitizedDiagram={sanitizedDiagram}
        rendering={rendering}
      />
      <MermaidGallery
        history={history}
        onSelectHistory={handleSelectHistory}
        onClearHistory={handleClearHistory}
      />
    </div>
  )
}
