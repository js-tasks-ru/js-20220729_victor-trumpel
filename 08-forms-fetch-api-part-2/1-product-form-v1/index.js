import { SelectInput } from './SelectInput.js';
import { ImageInput } from './ImageInput.js';
import fetchJson from './utils/fetch-json.js';
import createDomElement from './utils/createDomElement.js'
import MemoDOM from './MemoDom.js'

const BACKEND_URL = 'https://course-js.javascript.ru/api/rest/';

export default class ProductForm {
  #elementDOM = null
  #categories = []
  #baseUrl = new URL(`${BACKEND_URL}`)
  #memo = new MemoDOM()

  #ImageInput = null

  onSubmitForm = (event) => {
    event.preventDefault()
    this.save()
  }

  constructor (productId) {
    this.productId = productId;
  }

  get element() {
    return this.#elementDOM
  }

  async save() {
    const product = this.getFormData()
  
    try {
      await fetchJson(`${this.#baseUrl}products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
    } catch (error) {
      console.error('что-то пошло не так', error);
    }
  }

  loadCategories() {
    const categoriesUrl = new URL('categories', this.#baseUrl)

    categoriesUrl.searchParams.set('_sort', 'weight')
    categoriesUrl.searchParams.set('_refs', 'subcategory')

    return fetchJson(categoriesUrl)
  }

  loadProductData () {
    if (!this.productId) return null
    return fetchJson(`${this.#baseUrl}products?id=${this.productId}`);
  }

  getFormData() {
    const formPayload = {}
    
    const formatToNumber = ['form-status']

    Object.entries(this.#memo.cache).forEach(([key, inputDOM]) => {
      if (!key.startsWith('form-')) return

      const value = inputDOM.type === 'number' || formatToNumber.includes(key)
        ? parseInt(inputDOM.value)
        : inputDOM.value
        
      formPayload[key.split('form-')[1]] = value
    })

    formPayload.images = this.#ImageInput.images

    this.productId && (formPayload.id = this.productId)

    return formPayload
  }

  async render() {
    const [categories, formData] =  await Promise.all(
      [this.loadCategories(), this.loadProductData()]
    )

    const productData = formData?.[0]

    this.#elementDOM = createDomElement(this.buildTemplate(productData)) 

    this.#ImageInput = new ImageInput(productData?.images)

    const StatusSelect = new SelectInput({
      name: 'status',
      options: [
        { id: '1', title: 'Активен'},
        { id: '0', title: 'Неактивен'}
      ]
    })

    const CategorySelect = new SelectInput({
      name: 'subcategory',
      options: categories
    })

    this.renderTree(this.#elementDOM, { 
      StatusSelect, 
      CategorySelect, 
      ImageInput: this.#ImageInput 
    })

    this.#memo.memoizeDocument(this.#elementDOM)
    this.initEventListeners()
  }

  remove() {
    this.#elementDOM.remove()
  }

  destroy() {
    this.remove()
    this.#elementDOM = null
    this.#memo.clear()
  }

  renderTree(elementDOM, componentLibrary) {
    const renderPlace = elementDOM.querySelectorAll('[data-mount]')

    renderPlace.forEach(elem => {
      const component = elem.dataset.mount
      const componentInstance = componentLibrary[component]
      componentInstance.render()
      elem.replaceWith(componentInstance.element)
    })
  }

  initEventListeners() {
    this.#elementDOM.addEventListener('submit', this.onSubmitForm)
  }

  buildTemplate(productData) {
    const { title, description, price, discount, quantity } = productData || {}

    console.log('description: ', description)

    return /*html*/`
      <form 
        data-memo="form"
        data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input 
              data-memo="form-title"
              value="${title || ''}"
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
          >${description || ''}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">

          <span data-mount="ImageInput"></span>

        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>

          <span data-mount="CategorySelect"></span> 

        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input 
              data-memo="form-price"
              required="" 
              value="${price || ''}"
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
              value="${discount || ''}"
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
            value="${quantity || ''}"
            name="quantity" 
            placeholder="1"
          >
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>

          <span data-mount="StatusSelect"></span>

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