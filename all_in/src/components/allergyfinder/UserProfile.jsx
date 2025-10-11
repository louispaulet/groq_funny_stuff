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
import { clearZoo, countZooEntries } from '../../lib/objectMakerStore'
import {
  clearNewsClassificationCount,
  readNewsClassificationCount,
} from '../../lib/newsAnalyzerStats'
import { clearPizzaGallery, countPizzaGalleryEntries } from '../../lib/pizzaGalleryCookie'

const CHAT_EXPERIENCE_LABELS = {
  allergyfinder: 'AllergyFinder',
  stlviewer: 'STL Studio',
  pokedex: 'Pokédex',
}

const ADJECTIVES = ['Curious', 'Vigilant', 'Bright', 'Calm', 'Resilient', 'Swift', 'Gentle', 'Lively', 'Mindful', 'Radiant']
const NOUNS = ['Aviator', 'Guardian', 'Navigator', 'Trailblazer', 'Harvest', 'Aurora', 'Sentinel', 'Voyager', 'Caretaker', 'Beacon']

const numberFormatter = new Intl.NumberFormat('en-US')

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

function formatNumber(value) {
  return numberFormatter.format(Math.max(0, Number(value) || 0))
}

export default function UserProfile() {
  const [profileName, setProfileName] = useState('')
  const [chatCounts, setChatCounts] = useState(() => readChatCounts())
  const [allergyCount, setAllergyCount] = useState(() => countAllergyEntries())
  const [allergyItems, setAllergyItems] = useState(() => parseAllergyList(readAllergyCookie()))
  const [objectCount, setObjectCount] = useState(() => countZooEntries())
  const [newsClassificationCount, setNewsClassificationCount] = useState(() => readNewsClassificationCount())
  const [pizzaGalleryCount, setPizzaGalleryCount] = useState(0)

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
    setObjectCount(countZooEntries())
    setNewsClassificationCount(readNewsClassificationCount())
    setPizzaGalleryCount(countPizzaGalleryEntries())
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
    Object.keys(CHAT_EXPERIENCE_LABELS).forEach((experienceId) => {
      clearSavedConversations(experienceId)
    })
    refreshStats()
  }

  function handleFlushAllergyData() {
    writeAllergyCookie('')
    clearAllergyConversationsCookie()
    refreshStats()
  }

  function handleClearObjectMaker() {
    clearZoo()
    refreshStats()
  }

  function handleResetNewsStats() {
    clearNewsClassificationCount()
    refreshStats()
  }

  function handleClearPizzaGallery() {
    clearPizzaGallery()
    refreshStats()
  }

  const totalChatsTracked = Object.values(chatCounts ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0)

  const summaryStats = [
    {
      id: 'total-chats',
      label: 'Total Chats Logged',
      value: formatNumber(totalChatsTracked),
      hint: 'Combined across all experiences.',
    },
    {
      id: 'allergy-count',
      label: 'Saved Allergies',
      value: formatNumber(allergyCount),
      hint: 'Markdown items kept locally.',
    },
    {
      id: 'object-count',
      label: 'Objects Created',
      value: formatNumber(objectCount),
      hint: 'Stored in your Object Zoo.',
    },
    {
      id: 'pizza-count',
      label: 'Pizza Gallery Items',
      value: formatNumber(pizzaGalleryCount),
      hint: 'Saved designs on this device.',
    },
  ]

  const experienceTiles = [
    {
      id: 'allergyfinder',
      label: 'AllergyFinder',
      icon: '🩺',
      value: chatCounts.allergyfinder ?? 0,
      description: 'Chats started with the allergy assistant.',
      cta: { to: '/allergyfinder', label: 'Open AllergyFinder' },
      onReset: () => handleFlushCount('allergyfinder'),
      resetLabel: 'Clear AllergyFinder history',
      footnote: 'Removes the cookie that stores saved conversations and counters for this experience.',
    },
    {
      id: 'stlviewer',
      label: 'STL Studio',
      icon: '🛠️',
      value: chatCounts.stlviewer ?? 0,
      description: 'Design and printing chats initiated in STL Studio.',
      cta: { to: '/stlviewer', label: 'Open STL Studio' },
      onReset: () => handleFlushCount('stlviewer'),
      resetLabel: 'Clear STL Studio history',
      footnote: 'Deletes the STL Studio chat cookie, including saved sessions and counters.',
    },
    {
      id: 'pokedex',
      label: 'Pokédex',
      icon: '🔍',
      value: chatCounts.pokedex ?? 0,
      description: 'Quick Pokédex lookups launched from this browser.',
      cta: { to: '/pokedex', label: 'Open Pokédex' },
      onReset: () => handleFlushCount('pokedex'),
      resetLabel: 'Clear Pokédex history',
      footnote: 'Erases the Pokédex chat cookie and any stored conversations.',
    },
    {
      id: 'objectmaker',
      label: 'Object Maker',
      icon: '🧱',
      value: objectCount,
      description: 'Objects saved to your local Object Zoo.',
      cta: { to: '/objectmaker/zoo', label: 'Visit Object Zoo' },
      onReset: handleClearObjectMaker,
      resetLabel: 'Delete saved objects',
      footnote: 'Removes every object stored in the Object Maker Zoo on this device.',
    },
    {
      id: 'pizzamaker',
      label: 'Pizza Maker',
      icon: '🍕',
      value: pizzaGalleryCount,
      description: 'Pizzas saved to your cookie-backed gallery.',
      cta: { to: '/pizza-maker', label: 'Open Pizza Maker' },
      onReset: handleClearPizzaGallery,
      resetLabel: 'Clear pizza gallery',
      footnote: 'Deletes every saved pizza render stored in browser cookies.',
    },
    {
      id: 'newsanalyzer',
      label: 'News Analyzer',
      icon: '📰',
      value: newsClassificationCount,
      description: 'Articles classified locally with the news workflow.',
      cta: { to: '/newsanalyzer', label: 'Open News Analyzer' },
      onReset: handleResetNewsStats,
      resetLabel: 'Reset article counter',
      footnote: 'Clears the local counter that tracks processed news articles.',
    },
  ]

  return (
    <div className="space-y-12">
      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                Profile
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-white">User Preferences &amp; Activity</h2>
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Generate a new alias, manage your local data, and see how often you revisit each tool. No information leaves
                  this tab.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Current alias
                </div>
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRegenerateProfile}
                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
                  >
                    Generate New Alias 🎲
                  </button>
                  <button
                    type="button"
                    onClick={handleFlushProfile}
                    className="inline-flex items-center rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 dark:border-red-600/60 dark:bg-slate-900 dark:text-red-200 dark:hover:bg-red-900/20"
                  >
                    Clear Alias 🗑️
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-lg font-semibold text-slate-900 shadow-inner dark:bg-slate-800 dark:text-slate-100">
                {profileName || 'No profile name stored'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Removing the alias resets the cookie immediately. A fresh name is generated next time you open this page.
              </p>
            </div>
          </div>
          <div className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Quick metrics</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {summaryStats.map((stat) => (
                <div key={stat.id} className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <div className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-4xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Saved Allergies 🗂️</h3>
            <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Your allergy notes stay local. Use the editor to update or remove items at any time.
            </p>
          </div>
          <Link
            to="/allergyfinder/cookies"
            className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            Edit Allergy List ✍️
          </Link>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-900 shadow-inner dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Allergens tracked</div>
            <div className="mt-2 text-5xl font-bold">{formatNumber(allergyCount)}</div>
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">Across saved markdown notes</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            {allergyItems.length > 0 ? (
              <ul className="grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                {allergyItems.map((item) => (
                  <li key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
                    {item}
                  </li>
                ))}
                {allergyCount > allergyItems.length ? (
                  <li className="rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-slate-500 dark:border-slate-600 dark:text-slate-400">
                    …and {formatNumber(allergyCount - allergyItems.length)} more saved locally.
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm italic text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
                No allergy notes saved yet.
              </div>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleFlushAllergyData}
                className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
              >
                Delete Allergy Notes &amp; Saved Chats 🧹
              </button>
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 shadow-inner dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
                Removing allergy data clears both the notes cookie and any saved AllergyFinder conversations from this browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6 rounded-4xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="space-y-2">
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Experience Snapshot 📊</h3>
          <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Each card reflects what&apos;s stored locally for a specific section. Manage your history, saved objects, and news
            analytics without leaving the profile page.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {experienceTiles.map((tile) => (
            <div
              key={tile.id}
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{tile.label}</div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{tile.description}</p>
                  </div>
                  <span className="text-2xl" aria-hidden="true">
                    {tile.icon}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{formatNumber(tile.value)}</div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={tile.cta.to}
                    className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    {tile.cta.label}
                  </Link>
                  <button
                    type="button"
                    onClick={tile.onReset}
                    className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
                  >
                    {tile.resetLabel}
                  </button>
                </div>
                <p className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                  {tile.footnote}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Reset chat-based experiences</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                This action clears every saved chat cookie for AllergyFinder, STL Studio, and the Pokédex in one click.
              </p>
            </div>
            <button
              type="button"
              onClick={handleFlushAllCounts}
              className="inline-flex items-center rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
            >
              Delete All Saved Chat History 🧽
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
