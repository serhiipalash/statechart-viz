import { isHidden } from './utils'

class Tracker {
  __init() {
    this.elements = new Map()
  }
  constructor() {
    Tracker.prototype.__init.call(this)

    if (typeof window !== 'undefined') {
      let timeout

      window.addEventListener('resize', () => {
        if (timeout) {
          cancelAnimationFrame(timeout)
        }
        timeout = requestAnimationFrame(() => {
          this.updateAll()
        })
      })
    }
  }

  updateAll() {
    Array.from(this.elements.keys()).forEach(key => {
      this.update(key, this.elements.get(key).element)
    })
  }

  update(id, element) {
    if (!this.elements.get(id)) {
      this.elements.set(id, {
        listeners: new Set(),
        element: element || undefined,
        rect: element ? element.getBoundingClientRect() : undefined,
        hidden: isHidden(element),
      })
    }
    const data = {
      ...this.elements.get(id),
      element: element || undefined,
      rect: element ? element.getBoundingClientRect() : undefined,
      hidden: isHidden(element),
    }

    this.notify(data)

    if (element) {
      const desc = element.querySelectorAll(`[data-id]`)

      Array.from(desc).forEach(el => {
        const id = el.getAttribute(`data-id`)

        this.update(id, el)
      })
    }
  }

  listen(id, listener) {
    if (!this.elements.get(id)) {
      this.elements.set(id, {
        listeners: new Set(),
        element: undefined,
        rect: undefined,
        hidden: true,
      })
    }

    const data = this.elements.get(id)

    data.listeners.add(listener)

    this.notify(data)
  }

  get(id) {
    if (this.elements.get(id)) {
      return this.elements.get(id)
    }

    return undefined
  }

  notify(data) {
    data.listeners.forEach(listener => {
      listener(data)
    })
  }
}

const tracker = new Tracker()

export { tracker }
