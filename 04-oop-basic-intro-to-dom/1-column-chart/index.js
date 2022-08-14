export default class ColumnChart {
  #chartHeight = 50
  #memoizedElements = {}
  #templateHTML = null

  constructor(props) {  
    this.render(props)
  }

  get element() {
    return this.#templateHTML
  }

  get chartHeight() {
    return this.#chartHeight
  }

  memoizeTemplate() {
    const memoElements = this.#templateHTML?.querySelectorAll('[data-memo]')
    for (const element of memoElements) {
      const key = element.dataset.memo
      this.#memoizedElements[key] = element
    }
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

    this.#templateHTML = toHTML(this.buildTemplate(props))
    this.memoizeTemplate()
  }

  buildTemplate({ data, label, formatHeading, value, link }) {
    const isDataEmpty = !data.length

    return String.raw`
      <div 
        class="column-chart ${isDataEmpty ? 'column-chart_loading' : ''}" 
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
      ? `<a class="column-chart__link" href="${link}">View all</a>`
      : ""
  }

  buildColumnTemplate(columnsData = []) {
    const maxValue = Math.max(...columnsData);
    const scale = this.chartHeight / maxValue;

    return columnsData.map((columnValue) => {
      const percent = ((columnValue / maxValue) * 100).toFixed(0);
      const value = String(Math.floor(columnValue * scale))
      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`
    }).join('')
  }

  remove() {
    this.#templateHTML?.remove();
  }

  destroy() {
    this.remove()
    this.#templateHTML = null
  }

  update(data) {
    if (this.#memoizedElements.body)
      this.#memoizedElements.body.innerHTML = this.buildColumnTemplate(data)
  }
}

export const toHTML = (strHTML = "") => {
  const fragment = document.createElement("fragment")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}