export default class NotificationMessage {
  static instance = null
  
  #templateHTML = null
  #timerId = null
  #duration = 0
  
  constructor(message, props) {
    if (NotificationMessage.instance) {
      NotificationMessage.instance.destroy()
    }
    this.#duration = props?.duration ? props?.duration : 0

    NotificationMessage.instance = this
    this.render({ message, ...props})
  }

  get element() {
    return this.#templateHTML
  }

  get duration() {
    return this.#duration
  }

  show(targetElement = null) {
    targetElement 
      ? targetElement.appendChild(this.#templateHTML)
      : document.body.appendChild(this.#templateHTML)

    this.#timerId = setTimeout(this.remove.bind(this), this.#duration)
  }

  remove() {
    this.#templateHTML?.remove()
    clearTimeout(this.#timerId)
  }

  destroy() {
    this.remove()
    this.#templateHTML = null
  }  

  render(props) {
    const renderProps = { message: '', type: '', ...props }

    this.#templateHTML = toHTML(this.buildTemplate(renderProps))
  }

  buildTemplate({ message, type }) {
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

export const toHTML = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}