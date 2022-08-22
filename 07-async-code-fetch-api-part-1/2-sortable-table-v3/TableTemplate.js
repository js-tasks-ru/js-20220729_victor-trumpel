export default class TableTemplate {
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
    console.log('buildData: ', buildData)
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