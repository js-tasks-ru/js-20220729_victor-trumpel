import createDomElement from "./utils/createDomElement.js"
import MemoDOM from "./MemoDom.js"
import fetchJson from "./utils/fetch-json.js";
import escapeHtml from "./utils/escape-html.js";

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';

export class ImageInput {
  #elementDOM = null
  #memo = new MemoDOM()
  #files = []

  uploadFile = async (event) => {
    const [file] = event.target.files
    if (!file) return
    const formData = new FormData()

    formData.append('image', file);

    const { uploadBtn, imageListContainer } = this.#memo.cache
    uploadBtn.classList.add('is-loading')
    uploadBtn.disabled = true;

    const image = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
      referrer: ''
    })

    imageListContainer.append(this.getImageItem(image.data.link, file.name));
    this.#files.push({ 
      source: file.name,
      url: image.data.link
    })

    uploadBtn.classList.remove('is-loading')
    uploadBtn.disabled = false
  }

  deleteImage = (event) => {
    if (!event.target.dataset.hasOwnProperty('deleteHandle')) return
    if (!event.target.closest('li')) return

    const liItem = event.target.closest('li')
    const image = liItem.querySelector('.sortable-table__cell-img')

    const imageUrl = image.src

    this.#files = this.#files.filter(({ url }) => url !== imageUrl)
    liItem.remove()
  }

  clickUploadBtn = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'

    fileInput.click()

    fileInput.oninput = this.uploadFile
  }

  constructor() {
    this.render()
  }

  get images() {
    return this.#files.map((image) => ({ ...image }))
  }

  get template() {
    return this.buildTemplate()
  }
  
  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = createDomElement(this.buildTemplate)
    this.#memo.memoizeDocument(this.#elementDOM)
    this.initEventListeners()
  }

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.#elementDOM = null
    this.#memo.clear()
  }

  initEventListeners() {
    const { uploadBtn, imageListContainer } = this.#memo.cache

    uploadBtn.addEventListener('click', this.clickUploadBtn)

    imageListContainer.addEventListener('click', this.deleteImage)
  }

  buildTemplate() {
    return /*html*/`
      <div>
        <label class="form-label">Фото</label>

        <ul class="sortable-list" data-memo="imageListContainer">
          
        </ul>

        <button 
          data-memo="uploadBtn"
          type="button" 
          name="uploadImage" 
          class="button-primary-outline"
        >
          <span>Загрузить</span>
        </button>
      </div>
    `
  }

  getImageItem (url, name) {
    const imageItemContainer = document.createElement('div');

    imageItemContainer.innerHTML = /*html*/`
      <li 
        class="products-edit__imagelist-item sortable-list__item"
      >
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return imageItemContainer.firstElementChild;
  }
}