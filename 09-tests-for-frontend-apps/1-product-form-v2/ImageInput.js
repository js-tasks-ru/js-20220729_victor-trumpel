import fetchJson from "./utils/fetch-json.js";
import escapeHtml from "./utils/escape-html.js";
import BaseComponent from "./BaseComponent.js";
import SortableList from "./SortableList.js"

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';

export class ImageInput extends BaseComponent {
  #elementDOM = null
  #files = []

  uploadFile = async (event) => {
    const [file] = event.target.files
    if (!file) return
    const formData = new FormData()

    formData.append('image', file);

    const { uploadBtn } = this.memo.cache
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

    const imageListContainer = this.components.ImageSortableList.element

    imageListContainer.append(this.getImageItem(image.data.link, file.name));
    this.#files.push({ 
      source: file.name,
      url: image.data.link
    })

    uploadBtn.classList.remove('is-loading')
    uploadBtn.disabled = false
  }

  clickUploadBtn = () => {
    const fileInput = document.createElement('input')
    fileInput.type = 'file'

    fileInput.click()

    fileInput.oninput = this.uploadFile
  }

  constructor(files = null) {
    super()
    this.#files = files ? files : []
  }

  get images() {
    const imageListContainer = this.components.ImageSortableList.element
    const imagesInfo = [...imageListContainer.childNodes].map((item) => {
      const img = item.querySelector('[data-image]')
      const url = img.src
      const source = img.alt
      return { url, source }
    })

    return imagesInfo
  }
  
  get element() {
    return this.#elementDOM
  }

  render() {
    this.#elementDOM = this.createDomElement(this.buildTemplate())

    const imagesItems = this.#files.map(({ url, source } = {}) => 
      this.createDomElement(this.buildImageTamplate(url, source))
    )
    const ImageSortableList = new SortableList({ items: imagesItems })

    this.setTree({ ImageSortableList })
    this.renderTree(this.#elementDOM)

    console.log(this.#elementDOM)

    this.memo.memoizeDocument(this.#elementDOM)
    this.initEventListeners()
  }

  remove() {
    this.#elementDOM?.remove()
  }

  destroy() {
    this.#elementDOM = null
    this.memo.clear()
  }

  initEventListeners() {
    const { uploadBtn } = this.memo.cache

    uploadBtn.addEventListener('click', this.clickUploadBtn)
  }

  buildTemplate() {
    return /*html*/`
      <div>
        <label class="form-label">Фото</label>

        <span data-mount="ImageSortableList"></span>

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

  buildImageTamplate(url, name) {
    return /*html*/`
      <li 
        class="products-edit__imagelist-item sortable-list__item"
        data-draggable
      >
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}" data-image>
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>
    `
  }

  getImageItem (url, name) {
    console.log('url: ', url)

    const imageItemContainer = document.createElement('div');

    imageItemContainer.innerHTML = this.buildImageTamplate(url, name);

    return imageItemContainer.firstElementChild;
  }
}