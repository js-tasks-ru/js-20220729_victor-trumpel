export default class SortableTable extends TableTemplate {
  #elementDOM = null
  
  #memo = new MemoDOM()

  data = []
  headerConfig = []
  sorted = {}

  constructor(headerConfig = [], {data = [], sorted = {}} = {}) {
    super()

    const fieldValue = sorted.id
    const orderValue = sorted.order

    this.data = data
    this.sorted = { fieldValue, orderValue }
    this.headerConfig = headerConfig

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

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.headerConfig = null
    this.data = null
    this.#memo.clear()
  }

  initColumnsActions() {
    const cacheDOM = this.#memo.cache
    cacheDOM.header.addEventListener('click', this.handleSort)
  }

  handleSort = (event) => {
    const element = event.target.closest('[data-sortable=true]')
    if (element) this.sort(element.dataset)
  }

  sort(colInfo) {
    const { id, order } = colInfo
    const changerOrder = { asc: 'desc', desc: 'asc' }
    this.sorted = { 
      fieldValue: id, 
      orderValue: order ? changerOrder[order] : 'asc'
    }

    this.showSortArrow()
    this.sortData()

    this.#memo.cache.body.innerHTML = this.buildTemplateBody()
  }

  sortData() {
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
}
