import fetchJson from './utils/fetch-json.js'
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class SortableTable {
  #elementDOM = null
  #apiUrl = ''
  #memo = new MemoDOM()

  isLoading = false

  data = []
  headerConfig = []
  sorted = {}
  isSortLocally = false

  onWindowScroll = async () => {
    const { bottom } = this.#elementDOM.getBoundingClientRect()
    const { clientHeight } = document.documentElement

    if (this.isLoading) return
    if (bottom >= clientHeight) return
    if (this.isSortLocally) return

    this.loadMoreData()
  }

  onSortClick = (event) => {
    const col = event.target.closest('[data-sortable=true]')
    if (!col) return 

    const { id, order } = col.dataset
    const changerOrder = { asc: 'desc', desc: 'asc' }
    this.sorted = { 
      fieldValue: id, 
      orderValue: order ? changerOrder[order] : 'asc'
    }

    this.showSortArrow()

    if (this.isSortLocally) {
      this.localSortData()
      this.updateTableBody()
      return
    }

    this.loadData()
  }

  constructor(headerConfig = [], 
    { 
      url = '', 
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      }, 
      isSortLocally = false 
    } = {}
  ) {
    this.#apiUrl = `${BACKEND_URL}/${url}`

    this.data = []
    this.sorted = { fieldValue: sorted.id, orderValue: sorted.order }
    this.headerConfig = headerConfig
    this.isSortLocally = isSortLocally

    this.loadData({ ...sorted })
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
    this.initEventListeners()
  }

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.headerConfig = null
    this.data = null

    this.#memo.clear()
    document.removeEventListener('scroll', this.onSortClick)
    window.removeEventListener('scroll', this.onWindowScroll)
  }

  initEventListeners() {
    this.#memo.cache.header.addEventListener('click', this.onSortClick)
    window.addEventListener('scroll', this.onWindowScroll)
  }

  async loadData() {
    const { fieldValue, orderValue } = this.sorted
    const request = `${this.#apiUrl}?_sort=${fieldValue}&_order=${orderValue}&_start=0&_end=30`
    const data = await fetchJson(request)
    this.data = data
    this.updateTableBody()
  }

  async loadMoreData() {
    this.isLoading = true
    const end = this.data.length + 30
    const start = this.data.length

    const { fieldValue, orderValue } = this.sorted
    const request = 
      `${this.#apiUrl}?_sort=${fieldValue}&_order=${orderValue}&_start=${start}&_end=${end}`
    const data = await fetchJson(request)
    this.data.push(...data)

    const newRowsWrapper = createDomElement(/*html*/`
      <div>${this.buildTemplateBody(data)}</div>
    `)    

    this.#memo.cache.body.append(...newRowsWrapper.children)

    this.isLoading = false
  }

  updateTableBody() {
    this.#memo.cache.body.innerHTML = this.buildTemplateBody()
  }

  localSortData() {
    const { fieldValue, orderValue } = this.sorted
    const { sortType } = this.headerConfig.find(col => col.id === fieldValue)
    const direction = { asc: 1, desc: -1 }

    const sorter = {
      string: (a, b) => 
        direction[orderValue] * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en']),
      number: (a, b) => direction[orderValue] * (a[fieldValue] - b[fieldValue])
    }

    this.data.sort(sorter[sortType])
  }

  showSortArrow() {
    const { fieldValue, orderValue } = this.sorted
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

  buildTemplateBody(customData) {
    const buildData = customData || this.data
    return buildData.map((product) => this.buildTemplateRow(product)).join('')
  }

  buildTemplateHeader() {
    return this.headerConfig.map(({ id, title, sortable } = {}) => (
      /*html*/`
      <div 
        class="sortable-table__cell"
        data-memo="sort-cell-${id}"
        data-id="${id}" 
        data-sortable="${sortable}" 
        data-order="${
          this.sorted.fieldValue === id 
            ? this.sorted.orderValue 
            : ''
        }"
      >
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`
    )).join('') 
  }

  buildTemplateRow(product) {
    const row = this.headerConfig.map((col) => {
      if (!product[col.id]) return
      if (col.template) return col.template(product[col.id])
      return /*html*/`
        <div class="sortable-table__cell">${product[col.id]}</div>
      `
    }).join("")

    return /*html*/`
      <a href="/products/${product.id}" class="sortable-table__row">
        ${row}
      </a>
    `
  }
}
