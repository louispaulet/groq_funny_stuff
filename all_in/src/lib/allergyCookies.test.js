import { beforeEach, describe, expect, test } from 'vitest'
import {
  clearAllergyConversationsCookie,
  clearChatCount,
  readChatCounts,
  readAllergyConversationsCookie,
  writeAllergyConversationsCookie,
} from './allergyCookies'

function installCookieStub() {
  let store = {}
  const cookieDescriptor = {
    configurable: true,
    get() {
      return Object.entries(store)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')
    },
    set(value) {
      if (typeof value !== 'string') return
      const [pair, ...attrs] = value.split(';')
      const [rawName, ...rest] = pair.split('=')
      const name = rawName.trim()
      const encodedValue = rest.join('=').trim()
      if (!name) return
      const normalizedAttrs = attrs.map((item) => item.trim().toLowerCase())
      if (normalizedAttrs.some((attr) => attr === 'max-age=0')) {
        delete store[name]
        return
      }
      store[name] = encodedValue
    },
  }
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {},
  })
  Object.defineProperty(globalThis.document, 'cookie', cookieDescriptor)

  return {
    reset() {
      store = {}
    },
  }
}

const cookieStub = installCookieStub()

beforeEach(() => {
  cookieStub.reset()
})

function buildConversation(id) {
  return {
    id,
    title: `Conversation ${id}`,
    messages: [
      {
        role: 'assistant',
        content: 'Hello',
        timestamp: Date.now(),
      },
      {
        role: 'user',
        content: 'Hi',
        timestamp: Date.now(),
      },
    ],
  }
}

describe('allergy conversation persistence', () => {
  test('synchronises chat count with saved conversations', () => {
    writeAllergyConversationsCookie([buildConversation('a'), buildConversation('b')])

    const counts = readChatCounts()
    expect(counts.allergyfinder).toBe(2)
    expect(readAllergyConversationsCookie()).toHaveLength(2)
  })

  test('chat count falls back to saved conversation length when counter cookie missing', () => {
    writeAllergyConversationsCookie([buildConversation('a')])
    clearChatCount('allergyfinder')

    const counts = readChatCounts()
    expect(counts.allergyfinder).toBe(1)
  })

  test('clearing allergy conversations resets counter', () => {
    writeAllergyConversationsCookie([buildConversation('a')])
    clearAllergyConversationsCookie()

    const counts = readChatCounts()
    expect(counts.allergyfinder).toBe(0)
    expect(readAllergyConversationsCookie()).toHaveLength(0)
  })
})
