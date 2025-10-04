import { useState } from 'react'
import Sidebar from '../Sidebar'
import MessageList from './MessageList'
import Composer from './Composer'
import ModelSelector from '../ModelSelector'
import BarcodeScannerModal from '../common/BarcodeScannerModal'
import { useChatSession } from './useChatSession'

export default function ChatExperience({ experience }) {
  const {
    activeId,
    assistantName,
    conversations,
    enableBarcodeScanner,
    endpointDisplay,
    handleClear,
    handleFlushHistory,
    handleNewConversation,
    handleRename,
    handleSend,
    handleStop,
    loading,
    messages,
    model,
    persistConversations,
    placeholder,
    prompt,
    setActiveId,
    setModel,
    setPrompt,
  } = useChatSession(experience)

  const [scannerOpen, setScannerOpen] = useState(false)

  function handleBarcodeDetected(code) {
    if (!enableBarcodeScanner) return
    const normalized = `${code}`.trim()
    if (!normalized) return
    setScannerOpen(false)
    setPrompt(normalized)
    handleSend(normalized)
  }

  return (
    <div className="grid gap-6 md:grid-cols-12">
      <aside className="md:col-span-4 lg:col-span-3">
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={setActiveId}
          onNew={handleNewConversation}
          onRename={handleRename}
          onFlushHistory={persistConversations ? handleFlushHistory : undefined}
          disableNew={loading}
          disableFlush={loading}
        />
      </aside>
      <section className="md:col-span-8 lg:col-span-9 flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Session settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a model and endpoint for this workspace.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <ModelSelector value={model} onChange={setModel} options={experience?.modelOptions || []} />
            </div>
          </div>
          <div className="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Assistant</span>: {assistantName}
            </div>
            <div>
              <span className="font-semibold text-slate-600 dark:text-slate-300">Endpoint</span>: {endpointDisplay || 'Not configured'}
            </div>
          </div>
        </div>

        <MessageList experience={experience} messages={messages} />

        <Composer
          value={prompt}
          onChange={setPrompt}
          onSend={handleSend}
          onStop={handleStop}
          onClear={handleClear}
          loading={loading}
          placeholder={placeholder}
          onOpenScanner={enableBarcodeScanner ? () => setScannerOpen(true) : undefined}
        />
      </section>
      {enableBarcodeScanner && (
        <BarcodeScannerModal
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onDetected={handleBarcodeDetected}
        />
      )}
    </div>
  )
}
