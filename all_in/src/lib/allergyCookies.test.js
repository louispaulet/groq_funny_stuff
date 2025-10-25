import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import {
  clearAllergyConversationsCookie,
  clearChatCount,
  clearSavedConversations,
  readChatCounts,
  readAllergyConversationsCookie,
  readSavedConversations,
  writeAllergyConversationsCookie,
  writeSavedConversations,
} from './allergyCookies'
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

  test('other experiences persist conversations and counters', () => {
    writeSavedConversations('stlviewer', [buildConversation('s1')])
    writeSavedConversations('pokedex', [buildConversation('p1'), buildConversation('p2')])

    const counts = readChatCounts()
    expect(counts.stlviewer).toBe(1)
    expect(counts.pokedex).toBe(2)
    expect(readSavedConversations('stlviewer')).toHaveLength(1)
    expect(readSavedConversations('pokedex')).toHaveLength(2)

    clearSavedConversations('stlviewer')
    clearChatCount('pokedex')

    expect(readSavedConversations('stlviewer')).toHaveLength(0)
    expect(readChatCounts().stlviewer).toBe(0)
    expect(readChatCounts().pokedex).toBe(2)

    clearSavedConversations('pokedex')
    expect(readChatCounts().pokedex).toBe(0)
  })

  test('persists complete conversations without cropping messages', () => {
    const long = 'x'.repeat(1200)
    const messages = Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `${long}-${index}`,
      timestamp: Date.now() + index,
    }))

    writeSavedConversations('stlviewer', [
      {
        id: 'deep-history',
        title: 'Full chat',
        messages,
      },
    ])

    const saved = readSavedConversations('stlviewer')
    expect(saved).toHaveLength(1)
    expect(saved[0].messages).toHaveLength(messages.length)
    expect(saved[0].messages[0].content).toBe(`${long}-0`)
    expect(saved[0].messages.at(-1).content).toBe(`${long}-9`)
  })

  test('stores all conversations and keeps ordering stable', () => {
    const conversations = Array.from({ length: 5 }, (_, index) => ({
      id: `c-${index}`,
      title: `Conversation ${index}`,
      messages: [
        { role: 'user', content: `hi-${index}`, timestamp: Date.now() + index },
      ],
    }))

    writeSavedConversations('pokedex', conversations)

    const saved = readSavedConversations('pokedex')
    expect(saved).toHaveLength(conversations.length)
    expect(saved.map((conversation) => conversation.id)).toEqual(
      conversations.map((conversation) => conversation.id),
    )
  })

  test('splits oversized payloads across chunked cookies', () => {
    const giantMessage = 'g'.repeat(6000)
    writeSavedConversations('pokedex', [
      {
        id: 'giant',
        title: 'Huge chat',
        messages: [
          { role: 'user', content: giantMessage, timestamp: Date.now() },
        ],
      },
    ])

    const cookies = cookieStub.snapshot()
    const keys = Object.keys(cookies).filter((key) => key.startsWith('allin_conversations_pokedex'))
    expect(keys.length).toBeGreaterThan(1)
  })
})
