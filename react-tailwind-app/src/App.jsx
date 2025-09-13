import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            React + Tailwind
          </h1>
          <p className="mt-3 text-slate-600">
            Vite project bootstrapped with Tailwind CSS.
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={() => setCount((c) => c + 1)}
          >
            Count is {count}
          </button>
          <p className="mt-3 text-sm text-slate-600">
            Edit <code className="font-mono text-slate-800">src/App.jsx</code> and save to test HMR.
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
