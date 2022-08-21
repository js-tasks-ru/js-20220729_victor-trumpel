import fetchJson from './utils/fetch-json.js'
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'
import ColumnChartTemplate from './ColumnChartTemplate.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ColumnChart extends ColumnChartTemplate {
  #chartHeight = 50
  #elementDOM = null
  #memo = new MemoDOM()
  #apiUrl = ''

  constructor({ url = '', range, ...props } = {}) {  
    super()
    this.#apiUrl = `${BACKEND_URL}/${url}`
    this.render(props)
    this.update(range?.from, range?.to)
  }

  get element() {
    return this.#elementDOM
  }

  get chartHeight() {
    return this.#chartHeight
  }

  get subElements() {
    return this.#memo.cache
  }

  remove() {
    this.#elementDOM?.remove();
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
  }

  async fetchData({ from = new Date(), to = new Date() } = {}) {
    const fromISO = from.toISOString()
    const toISO = to.toISOString()
    const request = `${this.#apiUrl}?from=${fromISO}&to=${toISO}`
    const data = await fetchJson(request)
    
    return Object.values(data)
  }

  async update(from, to) {
    this.#elementDOM.classList.add('column-chart_loading')

    const data = await this.fetchData({ from, to })

    this.#elementDOM.classList.remove('column-chart_loading')

    const columnBody = this.#memo.cache.body
    if (columnBody)
      columnBody.innerHTML = this.buildColumnTemplate(data)
  }

  render(renderProps = {}) {
    const props = {
      data: [],
      label: "",
      value: 0,
      link: "",
      formatHeading: (value) => value,
      ...renderProps
    }

    this.#elementDOM = createDomElement(this.buildTemplate(props))
    this.#memo.memoizeDocument(this.#elementDOM)
  }
}
