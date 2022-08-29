import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';
import { categoryOptions } from './utils/categoryOptions.js'
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru/api/rest/';

export default class ProductForm {
  #elementDOM = null
  #categories = []
  #baseUrl = new URL(`${BACKEND_URL}`)
  #memo = new MemoDOM()

  onSubmitForm = (event) => {
    event.preventDefault()
    const formPayload = {}
    
    Object.entries(this.#memo.cache).forEach(([key, inputDOM]) => {
      if (!key.startsWith('form-')) return
      formPayload[key.split('form-')[1]] = inputDOM.value
    })

    // куда-то отправлять 
  }

  constructor (productId) {
    this.productId = productId;
  }

  get element() {
    return this.#elementDOM
  }

  async loadOptions() {
    const categoriesUrl = new URL('categories', this.#baseUrl)

    categoriesUrl.searchParams.set('_sort', 'weight')
    categoriesUrl.searchParams.set('_refs', 'subcategory')

    this.#categories = await fetchJson(categoriesUrl)
  }

  async render () {
    await this.loadOptions()
    this.#elementDOM = createDomElement(this.buildTemplate()) 
    this.#memo.memoizeDocument(this.#elementDOM)
    this.initEventListeners()
  }

  initEventListeners() {
    this.#elementDOM.addEventListener('submit', this.onSubmitForm)
  }

  buildTemplate() {
    return /*html*/`
      <form 
        data-memo="form"
        data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input 
              data-memo="form-title"
              required="" 
              type="text" 
              name="title" 
              class="form-control" 
              placeholder="Название товара"
            >
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea 
            data-memo="form-description"
            required="" 
            class="form-control" 
            name="description" 
            data-element="productDescription" 
            placeholder="Описание товара"
          ></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list">
              <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input 
              type="hidden" 
              name="url" 
              value="https://i.imgur.com/MWorX2R.jpg"
            >
            <input 
              type="hidden" 
              name="source" 
              value="75462242_3746019958756848_838491213769211904_n.jpg"
            >
            <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="https://i.imgur.com/MWorX2R.jpg">
          <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
        </span>
            <button type="button">
              <img src="icon-trash.svg" data-delete-handle="" alt="delete">
            </button></li></ul></div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${new SelectInput('subcategory', this.#categories).template}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input 
              data-memo="form-price"
              required="" 
              type="number"
              name="price" 
              class="form-control" 
              placeholder="100"
            >
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input
              data-memo="form-discount"
              required=""
              type="number" 
              name="discount" 
              class="form-control" 
              placeholder="0"
            >
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input
            data-memo="form-quantity" 
            required="" 
            type="number" 
            class="form-control" 
            name="quantity" 
            placeholder="1"
          >
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          ${new SelectInput('status', [
            { id: "1", title: "Активен" }, 
            { id: "0", title: "Неактивен" }
          ]).template}
        </div>
        <div class="form-buttons">
          <button 
            data-memo="submit-btn"
            type="submit" 
            name="save" 
            class="button-primary-outline"
          >
            Сохранить товар
          </button>
        </div>
      </form>
    `
  }
}

class SelectInput {
  options = []
  name = ''

  get template() {
    return this.buildTemplate()
  }

  constructor(name = '', options = []) {
    this.options = options
    this.name = name
  }

  buildTemplate() {
    return /*html*/`
      <select
        data-memo="form-${this.name}"
        class="form-control" 
        name="${this.name}">
        ${this.options.map(({ id, title } = {}) => /*html*/`
          <option value="${id}">${title}</option>
        `).join('')}
      </select>  
    `
  }
}

class FileInput {

  constructor() {
    this.render()
  }

  get template() {
    return this.buildTemplate()
  }

  render() {

  }

  buildTemplate() {
    return /*html*/`
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>

        <div data-element="imageListContainer">
          <ul class="sortable-list">
            <li class="products-edit__imagelist-item sortable-list__item" style="">
              <input 
                type="hidden" 
                name="url" 
                value="https://i.imgur.com/MWorX2R.jpg"
              >
              <input 
                type="hidden" 
                name="source" 
                value="75462242_3746019958756848_838491213769211904_n.jpg"
              >
              <span>
                <img src="icon-grab.svg" data-grab-handle="" alt="grab">
                <img 
                  class="sortable-table__cell-img" 
                  alt="Image" 
                  src="https://i.imgur.com/MWorX2R.jpg"
                >
                <span>75462242_3746019958756848_838491213769211904_n.jpg</span>
              </span>

              <button type="button">
                <img src="icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            </li>
          </ul>
        </div>

        <button 
          type="button" 
          name="uploadImage" 
          class="button-primary-outline"
        >
          <input type="file">
          <span>Загрузить</span>
        </button>
      </div>
    `
  }
}
