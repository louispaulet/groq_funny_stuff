let activeId = null
const listeners = new Set()

export function subscribe(listener) {
  listeners.add(listener)
  listener(activeId)
  return () => listeners.delete(listener)
}

export function setActive(id) {
  activeId = id
  for (const l of listeners) l(activeId)
}

export function getActive() {
  return activeId
}

