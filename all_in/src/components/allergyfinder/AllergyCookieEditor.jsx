import { useEffect, useMemo, useState } from 'react'
import {
  ALLERGY_COOKIE_NAME,
  flushAllCookies,
  readAllergyCookie,
  writeAllergyCookie,
} from '../../lib/allergyCookies'

const PLACEHOLDER = `- Peanuts\n- Shellfish\n- Dairy\n- Eggs\n- Sesame\n- Tree nuts`

export default function AllergyCookieEditor() {
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState(null)

  const placeholder = useMemo(() => PLACEHOLDER, [])

  useEffect(() => {
    const existing = readAllergyCookie()
    setNotes(existing)
  }, [])

  function handleSave(event) {
    event.preventDefault()
    writeAllergyCookie(notes || '')
    setStatus({ type: 'success', message: 'Allergy notes saved to cookie.' })
  }

  function handleFlush() {
    flushAllCookies()
    setNotes('')
    setStatus({ type: 'warning', message: 'All cookies cleared for this site.' })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100">
        <h2 className="text-xl font-semibold">Allergy Cookie Editor</h2>
        <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
          Save a markdown list of allergens you or your household need to watch out for. The notes are stored in a browser
          cookie so you can quickly reference or reuse them when chatting with the assistant.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSave}>
        <label className="block space-y-2" htmlFor="allergy-cookie-textarea">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Allergy list</span>
          <textarea
            id="allergy-cookie-textarea"
            name="allergy-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={placeholder}
            rows={10}
            className="w-full rounded-2xl border border-slate-300 bg-white/80 p-4 font-mono text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-300 dark:focus:ring-emerald-300"
            aria-describedby="allergy-cookie-helper"
          />
        </label>
        <p id="allergy-cookie-helper" className="text-xs text-slate-500 dark:text-slate-400">
          {`Tip: This information is stored in the "${ALLERGY_COOKIE_NAME}" browser cookie. Use markdown lists, headings, or bold text to organise allergens by family members.`}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:opacity-50"
          >
            Save Cookie
          </button>
          <button
            type="button"
            onClick={handleFlush}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:focus-visible:outline-slate-500"
          >
            Delete All Cookies
          </button>
          {status ? (
            <span
              role="status"
              className={`text-sm ${
                status.type === 'success'
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-amber-600 dark:text-amber-300'
              }`}
            >
              {status.message}
            </span>
          ) : null}
        </div>
      </form>
    </div>
  )
}
