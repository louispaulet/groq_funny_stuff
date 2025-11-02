import { experiences } from '../config/experiences'

export const heroHighlights = [
  {
    title: 'Curated copilots',
    description:
      'Launch assistants tuned for research, image generation, structured data, and story-driven experiments — all inside the same shell.',
  },
  {
    title: 'Shared workflows',
    description:
      'Every project inherits chat history, saved galleries, and quick actions so you can hop between labs without context loss.',
  },
  {
    title: 'Playful iteration',
    description:
      'Mix benchmark labs with satirical pop-ups and toroidal automata. The Studio thrives on experimentation and delight.',
  },
]

export function createHeroStats({ experienceCount, categoryCount }) {
  return [
    {
      value: `${experienceCount}`,
      label: 'Studios & labs',
      detail: 'From allergy intelligence to cinematic car shoots.',
    },
    {
      value: `${categoryCount}`,
      label: 'Curated collections',
      detail: 'Browse by workflow, data source, or creative medium.',
    },
    {
      value: '< 1s',
      label: 'Groq response time',
      detail: 'Lightning-fast generations power every workspace.',
    },
  ]
}

export const curatedSpotlights = [
  {
    id: 'qa-arena',
    eyebrow: '🧠 Benchmark · Competitive',
    title: 'QA Arena',
    description:
      'Pit oss-20B against oss-120B on surprise Wikipedia topics. Watch five-second countdowns, live scoring, and question-by-question replays.',
    to: '/qa-arena',
    cta: 'Enter the arena',
    badge: 'Wikipedia-fueled trivia',
    accent: 'from-sky-500/25 via-purple-500/20 to-transparent',
  },
  {
    id: 'timeline',
    eyebrow: '📜 New · Diagramming',
    title: 'Timeline Studio',
    description:
      'Compose narrative timelines with Chronicle and the /obj route. Explore curated scenarios or write your own brief to produce scrollable, date-rich stories.',
    to: '/timeline-studio',
    cta: 'Launch Timeline Studio',
    badge: 'Chronicle-powered',
    accent: 'from-amber-500/25 via-orange-500/20 to-transparent',
  },
  {
    id: 'bank-holiday',
    eyebrow: '📅 Spotlight · Planning utility',
    title: 'Bank Holiday Planner',
    description:
      'Blend paid leave with official holidays across the USA, UK, France, Spain, and Italy. Compare streaks, track PTO totals, and export a ready-to-share itinerary.',
    to: '/bank-holiday-planner',
    cta: 'Launch planner',
    badge: 'Calendar heatmap included',
    accent: 'from-emerald-500/25 via-teal-500/20 to-transparent',
  },
  {
    id: 'second-hand-market',
    eyebrow: '🧤 Pop-up · Satirical',
    title: 'Second-Hand Food Market',
    description:
      'Wander a cursed bazaar of pre-loved cuisine. It is a playful stress test for Groq chat, UI theming, and whimsical copywriting inside the Studio shell.',
    to: '/second-hand-food-market',
    cta: 'Visit the market',
    badge: 'Curses included',
    accent: 'from-rose-500/25 via-amber-400/20 to-transparent',
  },
  {
    id: 'dalle-vs-flux',
    eyebrow: '🎨 Research drop',
    title: 'Flux vs DALL·E Comparison Lab',
    description:
      'Inspect 186 paired prompts rendered by Groq-hosted Flux Schnell and OpenAI’s DALL·E 3. Scan cost breakdowns, gallery pagination, and prompt-level metadata.',
    to: '/dalle-vs-flux',
    cta: 'Open comparison',
    badge: 'Cost transparency',
    accent: 'from-fuchsia-500/25 via-violet-500/20 to-transparent',
  },
]

export const heroExperienceOptions = [
  ...experiences
    .filter((experience) => experience.path && experience.name)
    .map((experience) => ({
      id: experience.id,
      path: experience.path,
      name: experience.name,
    })),
  {
    id: 'game-of-life-lab',
    path: '/game-of-life-lab',
    name: 'Game of Life Lab',
  },
]
