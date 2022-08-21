export default class ColumnChartTemplate {

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