import createDomElement from "./utils/createDomElement.js"
import fetchJson from "./utils/fetch-json.js"

export class SelectInput {
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
    this.#options = options
    this.#name = name
  }

  render() {
    this.#element = createDomElement(this.buildTemplate())
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