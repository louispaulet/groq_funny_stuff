export function installCookieStub() {
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
    snapshot() {
      return { ...store }
    },
  }
}
