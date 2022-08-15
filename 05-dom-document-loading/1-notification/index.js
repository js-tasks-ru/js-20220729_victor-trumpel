export default class NotificationMessage {
  static #instance = null
  
  #elementDOM = null
  #timerId = null
  #duration = 0
  
  constructor(message, props) {
    if (NotificationMessage.#instance) {
      NotificationMessage.#instance.destroy()
    }
    const { duration, type } = props || {}
    this.#duration = duration || 0

    NotificationMessage.#instance = this
    this.#render({ message, type })
  }

  get element() {
    return this.#elementDOM
  }

  get duration() {
    return this.#duration
  }

  show(targetElement = document.body) {
    targetElement.append(this.#elementDOM)

    this.#timerId = setTimeout(this.remove.bind(this), this.#duration)
  }

  remove() {
    this.#elementDOM?.remove()
    clearTimeout(this.#timerId)
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
  }  

  #render({ message = '', type = '' } = {}) {
    this.#elementDOM = createDomElement(this.#buildTemplate({ message, type }))
  }

  #buildTemplate({ message, type }) {
    return String.raw`
      <div class="notification ${type} fadeOut" style="--value:${this.#duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${type}</div>
          <div class="notification-body">
            ${message}
          </div>
        </div>
      </div>
    `
  }
}

export const createDomElement = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}