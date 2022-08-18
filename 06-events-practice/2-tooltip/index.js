class Tooltip {
  static #instance = null
  #elementDOM = null

  constructor() {
    if (Tooltip.#instance)
      return Tooltip.#instance
    
    Tooltip.#instance = this
  }

  get element() {
    return this.#elementDOM
  }

  handleMove(event) {
    if (!event.target.dataset.tooltip) {
      this.#elementDOM.remove()
      return
    }
    const text = event.target.dataset.tooltip
    this.render(text, event.clientX, event.clientY)
  }

  render(text = '', x = 0, y = 0) {
    const offset = 10
    this.#elementDOM.style.left = x + offset + 'px'
    this.#elementDOM.style.top = y + offset + 'px'
    this.#elementDOM.innerHTML = text
    document.body.append(this.#elementDOM)
  }

  destroy() {
    this.#elementDOM?.remove()
    this.#elementDOM = null
    document.removeEventListener('mousemove', this.handleMove)
  }

  getTemplate(text = '') {
    return /*html*/`<div class="tooltip">${text}</div>`
  }

  initialize () {
    document.addEventListener('mousemove', this.handleMove.bind(this))
    this.#elementDOM = createDomElement(this.getTemplate())
  }
}

export const createDomElement = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}

export default Tooltip;
