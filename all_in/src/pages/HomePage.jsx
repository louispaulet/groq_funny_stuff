import { useMemo, useRef } from 'react'
import GameOfLifeShowcase from '../components/home/GameOfLifeShowcase'
import { experiences } from '../config/experiences'
import { HeroSection } from '../components/home/HeroSection'
import { SpotlightSection } from '../components/home/SpotlightSection'
import { CollectionsSection } from '../components/home/CollectionsSection'
import { StudioIndexSection } from '../components/home/StudioIndexSection'
import { heroHighlights, heroExperienceOptions, curatedSpotlights, createHeroStats } from '../content/homeHighlights'
import { experienceCategories } from '../content/experienceCategories'
import { detailedCopyById } from '../content/experienceDetails'
import { tagsById } from '../content/experienceTags'

const experienceLookup = Object.fromEntries(experiences.map((experience) => [experience.id, experience]))
const heroStats = createHeroStats({
  experienceCount: experiences.length,
  categoryCount: experienceCategories.length,
})

export default function HomePage() {
  const collectionsSectionRef = useRef(null)

  const randomHeroExperience = useMemo(() => {
    if (heroExperienceOptions.length === 0) {
      return {
        id: 'game-of-life-lab',
        path: '/game-of-life-lab',
        name: 'Game of Life Lab',
      }
    }

    const randomIndex = Math.floor(Math.random() * heroExperienceOptions.length)
    return heroExperienceOptions[randomIndex]
  }, [])

  const heroCtaLabel =
    randomHeroExperience.id === 'game-of-life-lab'
      ? 'Meet the Game of Life Lab'
      : `Meet ${randomHeroExperience.name}`


  const handleBrowseExperiences = () => {
    collectionsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-16">
      <HeroSection
        highlights={heroHighlights}
        stats={heroStats}
        onBrowseExperiences={handleBrowseExperiences}
        featuredExperience={randomHeroExperience}
        featuredCtaLabel={heroCtaLabel}
      />
      <SpotlightSection spotlights={curatedSpotlights} />
      <CollectionsSection
        ref={collectionsSectionRef}
        categories={experienceCategories}
        experienceLookup={experienceLookup}
      />
      <GameOfLifeShowcase />
      <StudioIndexSection
        experiences={experiences}
        detailedCopyById={detailedCopyById}
        tagsById={tagsById}
      />
    </div>
  )
}
