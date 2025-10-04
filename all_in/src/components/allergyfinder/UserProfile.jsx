import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  countAllergyEntries,
  clearAllChatCounts,
  clearAllergyConversationsCookie,
  clearChatCount,
  clearSavedConversations,
  clearUserProfileName,
  readAllergyCookie,
  readChatCounts,
  readUserProfileName,
  writeAllergyCookie,
  writeUserProfileName,
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

function parseAllergyList(notes, limit = 12) {
  if (!notes) return []
  return notes
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*+\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, limit)
}

export default function UserProfile() {
  const [profileName, setProfileName] = useState('')
  const [chatCounts, setChatCounts] = useState(() => readChatCounts())
  const [allergyCount, setAllergyCount] = useState(() => countAllergyEntries())
  const [allergyItems, setAllergyItems] = useState(() => parseAllergyList(readAllergyCookie()))

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
    setAllergyItems(parseAllergyList(readAllergyCookie()))
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
    clearSavedConversations(experienceId)
    clearChatCount(experienceId)
    refreshStats()
  }

  function handleFlushAllCounts() {
    clearAllChatCounts()
    Object.keys(EXPERIENCE_LABELS).forEach((experienceId) => {
      clearSavedConversations(experienceId)
    })
    refreshStats()
  }

  function handleFlushAllergyData() {
    writeAllergyCookie('')
    clearAllergyConversationsCookie()
    refreshStats()
  }

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-100">
        <h2 className="text-2xl font-semibold">User Profile 👤</h2>
        <p className="mt-2 text-sm text-emerald-900/80 dark:text-emerald-100/80">
          🔐 The application generates a display alias so you can save notes without revealing personal details. Your profile name
          lives in a browser cookie on this device.
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
            Generate New Alias 🎲
          </button>
          <button
            type="button"
            onClick={handleFlushProfile}
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
          >
            Remove Profile Cookie 🗑️
          </button>
        </div>
        <p className="mt-3 rounded-2xl border border-red-300 bg-red-50/80 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          Important: Removing the profile cookie deletes the saved alias immediately. The next time you open this page a new
          randomly generated name will appear. ⚠️
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Saved Allergies 🗂️</h3>
          <Link
            to="/allergyfinder/cookies"
            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
          >
            Edit Allergy List ✍️
          </Link>
        </div>
        <div className="rounded-3xl border border-emerald-200 bg-white/85 p-5 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-900/20">
          <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-200">{allergyCount}</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">Allergens listed across your saved markdown notes. 📊</div>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-900/40 dark:text-emerald-100">
            {allergyItems.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5">
                {allergyItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
                {allergyCount > allergyItems.length ? (
                  <li className="italic text-emerald-700/80 dark:text-emerald-200/80">
                    …and {allergyCount - allergyItems.length} more allergens saved. ➕
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="italic text-emerald-700/80 dark:text-emerald-200/80">
                No allergy notes saved yet. 🕒
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
            type="button"
            onClick={handleFlushAllergyData}
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
          >
            Delete Allergy Notes & Saved Chats 🧹
          </button>
          <p className="rounded-xl border border-red-300 bg-red-50/80 px-4 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
            Important: This removes the allergy notes cookie and any saved AllergyFinder conversations from this browser. ⚠️
          </p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Chat Activity 📈</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">We snapshot how many conversations you have started in each
            demo. Counts are stored locally in a cookie. 🧮</p>
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
                Delete {EXPERIENCE_LABELS[experienceId] || experienceId} History 🗑️
              </button>
              <p className="rounded-lg border border-red-200 bg-red-50/80 p-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                Important: This deletes the saved cookie for this experience. Any stored conversations and counters are
                permanently removed from this browser. ⚠️
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
            Delete All Saved Chat History 🧽
          </button>
          <p className="rounded-xl border border-red-300 bg-red-50/90 px-4 py-2 text-xs text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-200">
            Important: This deletes every saved chat cookie across AllergyFinder, STL Studio, and the Pokédex on this device. ⚠️
          </p>
        </div>
      </section>
    </div>
  )
}
