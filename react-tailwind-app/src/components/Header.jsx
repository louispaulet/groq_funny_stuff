import ModelSelector from './ModelSelector'

export default function Header({ model, onModelChange }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/60 border-b border-slate-200">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600 text-white grid place-items-center font-semibold">G</div>
          <div>
            <div className="text-sm text-slate-500">Groq Chat</div>
            <div className="text-base font-semibold text-slate-800">React + Tailwind</div>
          </div>
        </div>
        <ModelSelector value={model} onChange={onModelChange} />
      </div>
    </header>
  )
}

