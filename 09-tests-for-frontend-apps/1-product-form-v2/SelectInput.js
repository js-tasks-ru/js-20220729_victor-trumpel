import BaseComponent from "./BaseComponent.js"

export default class SelectInput extends BaseComponent {
  #element = null

  #options = []
  #name = ''

  get template() {
    return this.buildTemplate()
  }

  get element() {
    return this.#element
  }

  constructor({ name = '', options = [] } = {}) {
    super()
    this.#options = options
    this.#name = name
  }

  render() {
    this.#element = this.createDomElement(this.buildTemplate())
  }

  buildTemplate() {
    return /*html*/`
      <select
        data-memo="form-${this.#name}"
        class="form-control" 
        name="${this.#name}">
        ${this.#options.map(({ id, title } = {}) => /*html*/`
          <option value="${id}">${title}</option>
        `).join('')}
      </select>  
    `
  }
}