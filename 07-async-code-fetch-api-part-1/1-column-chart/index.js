import fetchJson from './utils/fetch-json.js'
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'

const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ColumnChart {
  #chartHeight = 50
  #elementDOM = null
  #memo = new MemoDOM()
  #apiUrl = ''

  constructor({ url = '', range, ...props } = {}) {  
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
    this.#memo.clear()
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

  buildTemplate({ data, label, formatHeading, value, link } = {}) {
    return /*html*/`
      <div
        class="column-chart" 
        style="--chart-height: ${this.chartHeight}"
      >
        <div class="column-chart__title">
          ${label}
          ${this.buildLinkTemplate(link)}
        </div>
        <div class="column-chart__container">
          <div data-memo="header" class="column-chart__header">
            ${formatHeading(value)}
          </div>
          <div data-memo="body" class="column-chart__chart">
            ${this.buildColumnTemplate(data)}
          </div>
        </div>
      </div>
    `;
  }

  buildLinkTemplate(link) {
    return link
      ? /*html*/`<a class="column-chart__link" href="${link}">View all</a>`
      : ""
  }

  buildColumnTemplate(columnsData = []) {
    const maxValue = Math.max(...columnsData);
    const scale = this.chartHeight / maxValue;

    return columnsData.map((columnValue) => {
      const percent = ((columnValue / maxValue) * 100).toFixed(0);
      const value = String(Math.floor(columnValue * scale))
      return /*html*/`
        <div style="--value: ${value}" data-tooltip="${percent}%"></div>
      `
    }).join('')
  }
}
