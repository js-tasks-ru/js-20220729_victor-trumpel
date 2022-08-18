export default class SortableTable {
  #elementDOM = null
  
  #memo = new MemoDOM()

  #data = []
  #headerConfig = []
  #sorted = {}

  constructor(headerConfig = [], {data = [], sorted = {}} = {}) {
    const fieldValue = sorted.id
    const orderValue = sorted.order

    this.#data = data
    this.#sorted = { fieldValue, orderValue }
    this.#headerConfig = headerConfig

    this.sortData(fieldValue, orderValue)
    this.render()
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
    this.initColumnsActions()
  }

  handleSort(colInfo) {
    if (colInfo.sortable === "false") return
    const { id, order } = colInfo
    const changerOrder = { asc: 'desc', desc: 'asc' }
    this.#sorted = { 
      fieldValue: id, 
      orderValue: order ? changerOrder[order] : 'asc'
    }
    this.sort()
  }

  initColumnsActions() {
    const cacheDOM = this.#memo.cache

    Object.entries(cacheDOM).forEach(([elemKey, elemDOM]) => {
      if (!elemKey.startsWith('sort-cell')) return
      elemDOM.addEventListener('click', this.handleSort.bind(this, elemDOM.dataset))
    })
  }

  sort() {
    this.showSortArrow()
    this.sortData()

    this.#memo.cache.body.innerHTML = this.buildTemplateBody()
  }

  sortData() {
    const { fieldValue, orderValue } = this.#sorted
    const { sortType } = this.#headerConfig.find(col => col.id === fieldValue)
    const direction = { asc: 1, desc: -1 }

    const sorter = {
      string: (a, b) => 
        direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']),
      number: (a, b) => direction[orderValue] * (a[fieldValue] - b[fieldValue])
    }

    this.#data.sort(sorter[sortType])
  }

  showSortArrow() {
    const { fieldValue, orderValue } = this.#sorted
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
          ${this.buildTemplateBody()}
        </div>
      </div>
    `
  }

  buildTemplateHeader() {
    return this.#headerConfig.map(({ id, title, sortable } = {}) => (
      /*html*/`
      <div 
        class="sortable-table__cell"
        data-memo="sort-cell-${id}"
        data-id="${id}" 
        data-sortable="${sortable}" 
        data-order="${
          this.#sorted.fieldValue === id 
            ? this.#sorted.orderValue 
            : 'asc'
        }"
      >
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    )).join('') 
  }

  buildTemplateBody() {
    return this.#data.map((product) => this.buildTemplateRow(product)).join('')
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

export const createDomElement = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
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