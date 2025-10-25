import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import { clearImageHistory, readImageHistory, writeImageHistory } from './imageHistoryCookie'
import { installCookieStub } from './testCookieStub'

const cookieStub = installCookieStub()

const originalLocalStorage =
  typeof window !== 'undefined' && Object.prototype.hasOwnProperty.call(window, 'localStorage')
    ? window.localStorage
    : undefined

function disableLocalStorage() {
  if (typeof window === 'undefined') return
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem() {
        return null
      },
      setItem() {
        throw new Error('localStorage disabled for cookie chunking tests')
      },
      removeItem() {},
      key() {
        return null
      },
      get length() {
        return 0
      },
    },
  })
}

beforeEach(() => {
  cookieStub.reset()
  disableLocalStorage()
})

afterEach(() => {
  if (typeof window === 'undefined') return
  if (originalLocalStorage === undefined) {
    delete window.localStorage
  } else {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: originalLocalStorage,
    })
  }
})

describe('image history cookie persistence', () => {
  test('stores full history without truncation and preserves ordering', () => {
    const now = Date.now()
    const entries = Array.from({ length: 80 }, (_, index) => ({
      url: `https://example.com/${index}.png`,
      prompt: `Prompt ${index}`,
      timestamp: now + index,
    }))

    writeImageHistory(entries)

    const saved = readImageHistory()
    expect(saved).toHaveLength(entries.length)
    expect(saved[0]).toEqual(entries[0])
    expect(saved.at(-1)).toEqual(entries.at(-1))
  })

  test('splits large payloads across multiple cookies', () => {
    const now = Date.now()
    writeImageHistory([
      {
        url: 'https://example.com/giant.png',
        prompt: 'l'.repeat(6000),
        timestamp: now,
      },
    ])

    const cookies = cookieStub.snapshot()
    const keys = Object.keys(cookies).filter((key) => key.startsWith('allin_flux_image_history'))
    expect(keys.length).toBeGreaterThan(1)
  })

  test('clears all cookie chunks when history is removed', () => {
    writeImageHistory([
      { url: 'https://example.com/1.png', prompt: 'one', timestamp: Date.now() },
      { url: 'https://example.com/2.png', prompt: 'two', timestamp: Date.now() + 1 },
    ])

    clearImageHistory()

    const cookies = cookieStub.snapshot()
    const keys = Object.keys(cookies).filter((key) => key.startsWith('allin_flux_image_history'))
    expect(keys).toHaveLength(0)
    expect(readImageHistory()).toHaveLength(0)
  })
})
