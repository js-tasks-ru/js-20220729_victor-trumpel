class Tooltip {
  static #instance = null
  #elementDOM = null
  #toolTipContainer = null

  handleTooltipMove = (event) => {
    const offset = 10
    this.#elementDOM.style.left = event.clientX + offset + 'px'
    this.#elementDOM.style.top = event.clientY + offset + 'px'
  }

  onPointerOver = (event) => {
    const element = event.target.closest('[data-tooltip]')
    if (!element) {
      this.#elementDOM.remove()
      this.#toolTipContainer = null
      return
    }
    this.#toolTipContainer = element
    this.#toolTipContainer.addEventListener('mousemove', this.handleTooltipMove)
    this.render(element.dataset.tooltip)
  }

  constructor() {
    if (Tooltip.#instance)
      return Tooltip.#instance
    
    Tooltip.#instance = this
  }

  get element() {
    return this.#elementDOM
  }

  render(text = '') {
    this.#elementDOM.innerHTML = text
    document.body.append(this.#elementDOM)
  }

  destroy() {
    this.#elementDOM?.remove()
    this.#elementDOM = null
    this.#toolTipContainer = null
    document.removeEventListener('mousemove', this.onPointerOver)
  }

  getTemplate(text = '') {
    return /*html*/`<div class="tooltip">${text}</div>`
  }

  initialize () {
    document.addEventListener('pointerover', this.onPointerOver)
    this.#elementDOM = createDomElement(this.getTemplate())
  }
}

export const createDomElement = (strHTML = "") => {
  const fragment = document.createElement("div")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}

export default Tooltip;
