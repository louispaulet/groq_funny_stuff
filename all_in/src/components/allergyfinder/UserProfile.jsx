import { useEffect, useState } from 'react'
import {
  countAllergyEntries,
  clearAllChatCounts,
  clearAllergyConversationsCookie,
  clearChatCount,
  clearUserProfileName,
  readAllergyCookie,
  readChatCounts,
  readUserProfileName,
  writeAllergyCookie,
  writeUserProfileName,
  writeAllergyConversationsCookie,
} from '../../lib/allergyCookies'

const EXPERIENCE_LABELS = {
  allergyfinder: 'AllergyFinder',
  stlviewer: 'STL Studio',
  pokedex: 'Pokédex',
}

const ADJECTIVES = ['Curious', 'Vigilant', 'Bright', 'Calm', 'Resilient', 'Swift', 'Gentle', 'Lively', 'Mindful', 'Radiant']
const NOUNS = ['Aviator', 'Guardian', 'Navigator', 'Trailblazer', 'Harvest', 'Aurora', 'Sentinel', 'Voyager', 'Caretaker', 'Beacon']

function generateDisplayName() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adjective} ${noun}`
}

function formatAllergyPreview(notes) {
  if (!notes) return 'No allergy notes saved yet.'
  const trimmed = notes.trim()
  if (!trimmed) return 'No allergy notes saved yet.'
  if (trimmed.length <= 160) return trimmed
  return `${trimmed.slice(0, 160)}…`
}

export default function UserProfile() {
  const [profileName, setProfileName] = useState('')
  const [chatCounts, setChatCounts] = useState(() => readChatCounts())
  const [allergyCount, setAllergyCount] = useState(() => countAllergyEntries())
  const [allergyPreview, setAllergyPreview] = useState(() => formatAllergyPreview(readAllergyCookie()))

  useEffect(() => {
    let stored = readUserProfileName()
    if (!stored) {
      stored = generateDisplayName()
      writeUserProfileName(stored)
    }
    setProfileName(stored)
    refreshStats()
  }, [])

  function refreshStats() {
    setChatCounts(readChatCounts())
    setAllergyCount(countAllergyEntries())
    setAllergyPreview(formatAllergyPreview(readAllergyCookie()))
  }

  function handleRegenerateProfile() {
    const next = generateDisplayName()
    writeUserProfileName(next)
    setProfileName(next)
  }

  function handleFlushProfile() {
    clearUserProfileName()
    setProfileName('')
  }

  function handleFlushCount(experienceId) {
    clearChatCount(experienceId)
    refreshStats()
  }

  function handleFlushAllCounts() {
    clearAllChatCounts()
    refreshStats()
  }

  function handleFlushAllergyData() {
    writeAllergyCookie('')
    clearAllergyConversationsCookie()
    writeAllergyConversationsCookie([])
    refreshStats()
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100">
        <h2 className="text-2xl font-semibold">User Profile</h2>
        <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
          We generate a friendly alias so you can save notes without revealing personal details. Your profile name lives in a
          browser cookie on this device.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded-2xl bg-white/80 px-5 py-4 text-lg font-semibold text-emerald-700 shadow-sm dark:bg-slate-900/40 dark:text-emerald-200">
            {profileName || 'No profile name stored'}
          </div>
          <button
            type="button"
            onClick={handleRegenerateProfile}
            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
          >
            Generate New Alias
          </button>
          <button
            type="button"
            onClick={handleFlushProfile}
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
          >
            Danger: Erase Profile Cookie
          </button>
        </div>
        <p className="mt-3 rounded-2xl border border-red-300 bg-red-50/80 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          Warning: Flushing the profile cookie removes the saved alias immediately. The next time you open this page a new random
          name will be generated.
        </p>
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Chat Activity</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">We snapshot how many conversations you have started in each
            demo. Counts are stored locally in a cookie.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(chatCounts).map(([experienceId, count]) => (
            <div
              key={experienceId}
              className="space-y-3 rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-600"
            >
              <div className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {EXPERIENCE_LABELS[experienceId] || experienceId}
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{count}</div>
              <button
                type="button"
                onClick={() => handleFlushCount(experienceId)}
                className="inline-flex items-center rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-red-500"
              >
                Flush {EXPERIENCE_LABELS[experienceId] || experienceId} Count
              </button>
              <p className="rounded-lg border border-red-200 bg-red-50/80 p-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                Warning: This obliterates the stored counter for this experience. You cannot recover the previous total once cleared.
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleFlushAllCounts}
            className="inline-flex items-center rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-red-600"
          >
            Flush All Chat Counters
          </button>
          <p className="rounded-xl border border-red-300 bg-red-50/90 px-4 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
            Warning: This wipes every stored chat counter across AllergyFinder, STL Studio, and the Pokédex in one go.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Allergy Notebook Snapshot</h3>
        <div className="rounded-3xl border border-emerald-200 bg-white/85 p-5 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-900/20">
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-200">{allergyCount}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Allergens listed across your saved markdown notes.</div>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-100">
            {allergyPreview}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleFlushAllergyData}
              className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
            >
              Flush Allergy Notes & Saved Chats
            </button>
            <p className="rounded-xl border border-red-300 bg-red-50/80 px-4 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
              Critical warning: This clears the allergy notes cookie and any saved AllergyFinder conversations on this device.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
