const importMetaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined
const processEnv = typeof globalThis !== 'undefined' && globalThis.process?.env ? globalThis.process.env : undefined

function getEnvValue(key) {
  if (!key) return undefined
  if (importMetaEnv && importMetaEnv[key] !== undefined) return importMetaEnv[key]
  if (processEnv && processEnv[key] !== undefined) return processEnv[key]
  return undefined
}

const FALLBACK_BASE_URL = (getEnvValue('VITE_CHAT_BASE_URL') || 'https://groq-endpoint.louispaulet13.workers.dev').replace(/\/$/, '')

export const experiences = [
  {
    id: 'allergyfinder',
    path: '/allergyfinder',
    name: 'AllergyFinder',
    headline: 'OpenFoodFacts Allergy Assistant',
    description: 'Use Groq to explore ingredient lists, highlight allergens, and triage food questions with OpenFoodFacts context.',
    badge: 'Nutrition',
    heroGradient: 'from-emerald-500 to-teal-500',
    panelAccent: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200',
    navAccent: {
      gradient: 'from-emerald-500 to-teal-500',
      hover:
        'hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-400/60 dark:hover:bg-emerald-500/20 dark:hover:text-emerald-200 dark:hover:border-emerald-400/60',
      focus: 'focus-visible:ring-emerald-500/40',
    },
    defaultModel: 'openai/gpt-oss-20b',
    modelOptions: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'],
    greeting: "Hi! Ask me about allergens in any food and I'll look at OpenFoodFacts.",
    promptPlaceholder: 'Ask about allergens in a recipe or packaged food...',
    systemPrompt: [
      'You are an allergy assistant that uses OpenFoodFacts data to answer questions about food allergens.',
      'Use the provided context when it is relevant and be transparent about any gaps.',
      'Encourage users to double-check packaging for medical decisions.',
    ].join(' '),
    allowBaseUrlOverride: false,
    enableStlViewer: false,
    logLabel: 'AllergyFinder',
    defaultBaseUrl: (getEnvValue('VITE_ALLERGY_CHAT_BASE_URL') || FALLBACK_BASE_URL).replace(/\/$/, ''),
  },
  {
    id: 'stlviewer',
    path: '/stlviewer',
    name: 'STL Studio',
    headline: '3D Printing Copilot',
    description: 'Chat about STL files, design tweaks, and 3D printing tips while previewing models inline.',
    badge: '3D',
    heroGradient: 'from-indigo-500 to-slate-700',
    panelAccent: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-200',
    navAccent: {
      gradient: 'from-indigo-500 to-slate-700',
      hover:
        'hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-400/60 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-200 dark:hover:border-indigo-400/60',
      focus: 'focus-visible:ring-indigo-500/40',
    },
    defaultModel: 'openai/gpt-oss-20b',
    modelOptions: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'],
    greeting: 'Hi! Ask me anything about STL models or 3D printing workflows.',
    promptPlaceholder: 'Need help with an STL? Ask about fixes, slicing, or design tweaks...',
    systemPrompt: [
      'You are a helpful AI assistant who understands STL files and 3D printing workflows.',
      'Provide concise, practical answers and include tips for viewing or tweaking STL content when relevant.',
    ].join(' '),
    allowBaseUrlOverride: false,
    enableStlViewer: true,
    logLabel: 'STL Studio',
    defaultBaseUrl: (getEnvValue('VITE_STL_CHAT_BASE_URL') || FALLBACK_BASE_URL).replace(/\/$/, ''),
  },
  {
    id: 'pokedex',
    path: '/pokedex',
    name: 'Pokedex',
    headline: 'Concise Pokemon Companion',
    description: 'Ask for typings, strengths, weaknesses, and quick lore delivered by a remote Pokedex service.',
    badge: 'Pokemon',
    heroGradient: 'from-rose-500 to-orange-500',
    panelAccent: 'bg-rose-100 text-rose-900 dark:bg-rose-500/20 dark:text-rose-200',
    navAccent: {
      gradient: 'from-rose-500 to-orange-500',
      hover:
        'hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-400/60 dark:hover:bg-rose-500/20 dark:hover:text-rose-200 dark:hover:border-rose-400/60',
      focus: 'focus-visible:ring-rose-500/40',
    },
    defaultModel: 'openai/gpt-oss-20b',
    modelOptions: ['openai/gpt-oss-20b', 'openai/gpt-oss-120b'],
    greeting: 'Hi! Ask me about any Pokemon and I will fetch quick Pokedex facts.',
    promptPlaceholder: 'Example: What are Gengar strengths and weaknesses?',
    systemPrompt: [
      'You are a remote Pokedex assistant. Answer questions about Pokemon in two or three sentences.',
      'Highlight typings, notable strengths or weaknesses, and other concise Pokedex facts.',
      'If the question falls outside Pokemon, politely redirect the user.',
    ].join(' '),
    allowBaseUrlOverride: true,
    enableStlViewer: false,
    logLabel: 'Pokedex',
    defaultBaseUrl: (getEnvValue('VITE_POKEDEX_CHAT_BASE_URL') || FALLBACK_BASE_URL).replace(/\/$/, ''),
  },
]

export function getExperienceById(id) {
  return experiences.find((exp) => exp.id === id)
}
