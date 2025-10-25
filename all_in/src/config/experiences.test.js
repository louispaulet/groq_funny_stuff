import { describe, expect, test } from 'vitest'
import { experiences, getExperienceById } from './experiences'

describe('experiences configuration', () => {
  test('contains unique ids and paths', () => {
    const ids = new Set()
    const paths = new Set()

    experiences.forEach((experience) => {
      expect(typeof experience.id).toBe('string')
      expect(experience.id.length).toBeGreaterThan(0)
      expect(typeof experience.path).toBe('string')
      expect(experience.path.startsWith('/')).toBe(true)
      expect(typeof experience.name).toBe('string')
      expect(experience.name.length).toBeGreaterThan(0)
      expect(typeof experience.description).toBe('string')
      expect(experience.description.length).toBeGreaterThan(0)

      expect(ids.has(experience.id)).toBe(false)
      expect(paths.has(experience.path)).toBe(false)
      ids.add(experience.id)
      paths.add(experience.path)
    })
  })

  test('exposes retrievable experiences via getExperienceById', () => {
    experiences.forEach((experience) => {
      expect(getExperienceById(experience.id)).toBe(experience)
    })
    expect(getExperienceById('missing-id')).toBeUndefined()
  })

  test('declares required ui properties', () => {
    experiences.forEach((experience) => {
      expect(typeof experience.heroGradient).toBe('string')
      expect(typeof experience.badge).toBe('string')
      expect(typeof experience.headline).toBe('string')
      expect(Array.isArray(experience.modelOptions)).toBe(true)
      if (experience.navAccent) {
        expect(typeof experience.navAccent.gradient).toBe('string')
      }
    })
  })
})
