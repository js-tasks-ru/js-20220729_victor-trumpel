export default class ColumnChart {
  #chartHeight = 50
  #elementDOM = null
  #memo = new MemoDOM()

  constructor(props) {  
    this.#render(props)
  }

  get element() {
    return this.#elementDOM
  }

  get chartHeight() {
    return this.#chartHeight
  }

  remove() {
    this.#elementDOM?.remove();
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
  }

  update(data) {
    const columnBody = this.#memo.cache.body
    if (columnBody)
      columnBody.innerHTML = this.#buildColumnTemplate(data)
  }

  #render(renderProps = {}) {
    const props = {
      data: [],
      label: "",
      value: 0,
      link: "",
      formatHeading: (value) => value,
      ...renderProps
    }

    this.#elementDOM = createDomElement(this.#buildTemplate(props))
    this.#memo.memoizeDocument(this.#elementDOM)
  }

  #buildTemplate({ data, label, formatHeading, value, link }) {
    const isDataEmpty = !data.length

    return String.raw`
      <div 
        class="column-chart ${isDataEmpty ? 'column-chart_loading' : ''}" 
        style="--chart-height: ${this.chartHeight}"
      >
        <div class="column-chart__title">
          ${label}
          ${this.#buildLinkTemplate(link)}
        </div>
        <div class="column-chart__container">
          <div data-memo="header" class="column-chart__header">
            ${formatHeading(value)}
          </div>
          <div data-memo="body" class="column-chart__chart">
            ${this.#buildColumnTemplate(data)}
          </div>
        </div>
      </div>
    `;
  }

  #buildLinkTemplate(link) {
    return link
      ? `<a class="column-chart__link" href="${link}">View all</a>`
      : ""
  }

  #buildColumnTemplate(columnsData = []) {
    const maxValue = Math.max(...columnsData);
    const scale = this.chartHeight / maxValue;

    return columnsData.map((columnValue) => {
      const percent = ((columnValue / maxValue) * 100).toFixed(0);
      const value = String(Math.floor(columnValue * scale))
      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`
    }).join('')
  }
}

class MemoDOM {
  #cache = {}

  get cache() {
    return this.#cache
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