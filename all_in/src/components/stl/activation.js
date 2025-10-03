let activeId = null
const listeners = new Set()

export function subscribe(listener) {
  listeners.add(listener)
  listener(activeId)
  return () => listeners.delete(listener)
}

export function setActive(id) {
  activeId = id
  for (const listener of listeners) {
    listener(activeId)
  }
}

export function getActive() {
  return activeId
}
