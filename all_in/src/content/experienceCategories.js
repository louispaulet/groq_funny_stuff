import { experiences } from '../config/experiences'

const baseExperienceCategories = [
  {
    id: 'specialists',
    title: 'Specialist Assistants',
    description: 'Domain experts that deliver answers with context, transparency, and speed.',
    experienceIds: ['allergyfinder', 'newsanalyzer'],
  },
  {
    id: 'builders',
    title: 'Schema & 3D Labs',
    description: 'Structured creativity hubs for JSON schematics and printable meshes.',
    experienceIds: ['objectmaker', 'stlviewer'],
  },
  {
    id: 'svg',
    title: 'SVG Studios',
    description: 'Vector-first workspaces for programmatic art and evolving flags.',
    experienceIds: ['svglab', 'flagfoundry', 'emotionfoundry'],
  },
  {
    id: 'diagramming',
    title: 'Diagram Studios',
    description: 'Prompt Mermaid to map flows and keep every render close by.',
    experienceIds: ['mermaidstudio'],
    extraLinks: [
      {
        id: 'timeline-studio',
        name: 'Timeline Studio',
        to: '/timeline-studio',
      },
    ],
  },
  {
    id: 'visuals',
    title: 'Visual Launchpads',
    description: 'Image-first workflows that stage cinematic scenes and product-ready art.',
    experienceIds: ['imagegen', 'pizzamaker', 'carmaker'],
  },
  {
    id: 'play',
    title: 'Play & Discovery',
    description: 'Lighthearted sandboxes for fandoms, remixing, and storytelling breaks.',
    experienceIds: ['pokedex', 'sixdegrees', 'pongshowdown'],
  },
  {
    id: 'arenas',
    title: 'Benchmark Arenas',
    description: 'Competitive matchups that pit Groq-hosted models against curated challenges.',
    experienceIds: ['qaarena'],
  },
]

const categorizedExperienceIds = new Set(
  baseExperienceCategories.flatMap((category) => category.experienceIds)
)

const uncategorizedExperienceIds = experiences
  .map((experience) => experience.id)
  .filter((experienceId) => !categorizedExperienceIds.has(experienceId))

export const experienceCategories = uncategorizedExperienceIds.length
  ? [
      ...baseExperienceCategories,
      {
        id: 'fresh',
        title: 'Fresh Drops',
        description: 'New experiments and utilities that just landed in the studio.',
        experienceIds: uncategorizedExperienceIds,
      },
    ]
  : baseExperienceCategories
