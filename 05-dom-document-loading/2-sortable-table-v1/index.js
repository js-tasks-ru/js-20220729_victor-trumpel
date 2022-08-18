export default class SortableTable {
  #elementDOM = null
  
  #memo = new MemoDOM()

  #data = []
  #headerConfig = []

  constructor(headerConfig = [], data = []) {
    this.#data = data
    this.#headerConfig = headerConfig

    this.render({ headerConfig })
  }

  get element() {
    return this.#elementDOM
  }

  get subElements() {
    return this.#memo.cache
  }

  render() {
    this.#elementDOM = createDomElement(this.buildTemplate())
    this.#memo.memoizeDocument(this.#elementDOM)
  }

  sort(fieldValue = '', orderValue = '') {
    this.showSortArrow(fieldValue, orderValue)
    const sortedData = this.getSortedData(fieldValue, orderValue)

    this.#memo.cache.body.innerHTML = this.buildTemplateBody(sortedData)
  }

  getSortedData(fieldValue = '', orderValue = '') {
    const { sortType } = this.#headerConfig.find(col => col.id === fieldValue)
    const direction = { asc: 1, desc: -1 }

    const sorter = {
      string: (a, b) => direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']),
      number: (a, b) => direction[orderValue] * (a[fieldValue] - b[fieldValue])
    }

    return this.#data.sort(sorter[sortType])
  }

  showSortArrow(fieldValue = '', orderValue = '') {
    const cacheDOM = this.#memo.cache

    Object.entries(cacheDOM).forEach(([elemKey, elemDOM]) => {
      if (elemKey === `sort-cell-${fieldValue}`) {
        elemDOM.dataset.order = orderValue
        return
      }
      if (elemKey.startsWith('sort-cell'))
        elemDOM.dataset.order = ''
    })
  }

  buildTemplate() {
    return /*html*/`
      <div class="sortable-table">

        <div data-memo="header" class="sortable-table__header sortable-table__row">
          ${this.buildTemplateHeader()}
        </div>
        
        <div data-memo="body" class="sortable-table__body">
          ${this.buildTemplateBody(this.#data)}
        </div>
      </div>
    `
  }

  buildTemplateHeader() {
    return this.#headerConfig.map(({ id, title, sortable, order } = {}) => (
      /*html*/`
      <div 
        class="sortable-table__cell"
        data-memo="sort-cell-${id}"
        data-id="${id}" 
        data-sortable="${sortable}" 
        data-order="${order || ''}"
      >
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    )).join('') 
  }

  buildTemplateBody(data = []) {
    return data.map((product) => this.buildTemplateRow(product)).join('')
  }

  buildTemplateRow(product) {
    const { id, images, title, quantity, price, sales } = product || {}
    return /*html*/`
      <a href="/products/${id}" class="sortable-table__row">
        <div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="${images?.[0]?.url}">
        </div>
        <div class="sortable-table__cell">${title}</div>
        <div class="sortable-table__cell">${quantity}</div>
        <div class="sortable-table__cell">${price}</div>
        <div class="sortable-table__cell">${sales}</div>
      </a>
    `
  }

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.#headerConfig = null
    this.#data = null
    this.#memo.clear()
  }
}

class MemoDOM {
  #cache = {}

  get cache() {
    return this.#cache
  }

  clear() {
    this.#cache = {}
  }

  memoizeDocument(document) {
    if (!document) return
    const elementNeedCache = document.querySelectorAll('[data-memo]')

    for (const element of elementNeedCache) {
      const key = element.dataset.memo
      this.#cache[key] = element
    }
  }
}

export const createDomElement = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}