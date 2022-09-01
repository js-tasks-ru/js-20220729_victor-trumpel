import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import { headerConfig } from './assets/headerConfig.js';

import createDomElement from './utils/createDomElement.js'
import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

const ordersChart = new ColumnChart({
  label: 'Заказы',
  link: 'orders',
  url: 'api/dashboard/orders',
  range: {
    from: new Date(),
    to: new Date(),
  }
})

const salesChart = new ColumnChart({
  label: 'Продажи',
  link: 'sales',
  url: 'api/dashboard/sales',
  range: {
    from: new Date(),
    to: new Date(),
  }
})

const clientsChart = new ColumnChart({
  label: 'Продажи',
  link: 'sales',
  url: 'api/dashboard/sales',
  range: {
    from: new Date(),
    to: new Date(),
  }
})

const rangePicker = new RangePicker({
  from: new Date('08.01.2022'),
  to: new Date()
})

const sortableTable = new SortableTable(
  headerConfig,
  {
    url: 'api/dashboard/bestsellers',
    sorted: {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc'
    },
    isSortLocally: true,
    step: 20,
    start: 1,
    end: 20
  }
)

export default class Page {
  #elementDOM = null

  get element() {
    return this.#elementDOM
  }

  async render() {
    this.#elementDOM = createDomElement(this.buildTemplate())

    this.renderTree(this.#elementDOM, { 
      ordersChart, 
      salesChart,
      clientsChart,
      rangePicker,
      sortableTable
    })

    await Promise.all([this.updateCharts(), this.updateTable()])

    this.initEventListeners()
  }

  initEventListeners() {
    rangePicker.element.addEventListener('date-select', (event) => {
      this.updateCharts()
      this.updateTable()
    })
  }

  async updateCharts() {
    const { from, to } = rangePicker.selected
    return Promise.all([
      ordersChart.update(from, to),
      salesChart.update(from, to),
      clientsChart.update(from, to)
    ])
  }

  async updateTable() {
    const { from, to } = rangePicker.selected
    const url = new URL(`${BACKEND_URL}api/dashboard/bestsellers`)

    const { id, order, start } = sortableTable.sorted

    url.searchParams.set('_sort', id);
    url.searchParams.set('_order', order);
    url.searchParams.set('_start', start);
    url.searchParams.set('_end', 20);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    const data = await fetchJson(url)

    sortableTable.data = []

    sortableTable.subElements.body.innerHTML = ''

    sortableTable.update(data)
  }

  renderTree(elementDOM, componentLibrary) {
    const renderPlace = elementDOM.querySelectorAll('[data-mount]')

    renderPlace.forEach(elem => {
      const component = elem.dataset.mount
      const componentInstance = componentLibrary[component]
      elem.replaceWith(componentInstance.element)
    })
  }

  buildTemplate() {
    return /*html*/`
      <div>
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
          <span data-mount="rangePicker"></span>
        </div>
        <div class="dashboard__charts">
          <span data-mount="ordersChart"></span>
          <span data-mount="salesChart"></span>
          <span data-mount="clientsChart"></span>
        </div>

        <h3 class="block-title">Лидеры продаж</h3>
        <span data-mount="sortableTable"></span>
      </div>
    `
  }
}
