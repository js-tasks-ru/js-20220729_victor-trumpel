import fetchJson from './utils/fetch-json.js'
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'
import TableTemplate from './TableTemplate.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class SortableTable extends TableTemplate {
  #elementDOM = null
  #apiUrl = ''
  #memo = new MemoDOM()

  isLoading = false

  data = []
  headerConfig = []
  sorted = {}

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
    super()

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
    this.initColumnsActions()
    this.initScrollAction()
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
    document.removeEventListener('scroll', this.handleScroll)
  }

  initScrollAction() {
    document.addEventListener('scroll', this.handleScroll)
  }

  initColumnsActions() {
    const cacheDOM = this.#memo.cache
    cacheDOM.header.addEventListener('click', this.handleSort)
  }

  handleScroll = async (event) => {
    if (this.isLoading) return 
    const block = this.#memo.cache.body
    const contentHeight = block.offsetHeight
    const yOffset = window.pageYOffset
    const window_height = window.innerHeight
    const y = yOffset + window_height
    
    if(!(y >= contentHeight)) return

    this.loadMoreData() 
  }

  handleSort = (event) => {
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

  async loadData() {
    const { fieldValue, orderValue } = this.sorted
    const request = `${this.#apiUrl}?_sort=${fieldValue}&_order=${orderValue}&_start=0&_end=30`
    const data = await fetchJson(request)
    this.data = data
    this.updateTableBody()
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
}
