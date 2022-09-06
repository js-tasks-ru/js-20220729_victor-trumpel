export default class BaseComponent {
  #memo = new MemoDOM()
  #components = {}

  get memo() {
    return this.#memo
  }

  get components() {
    return this.#components
  }

  createDomElement(strHTML = "") {
    const wrapper = document.createElement("div")
    wrapper.innerHTML = strHTML
    return wrapper.firstElementChild
  }

  renderTree(elementDOM) {
    const renderPlace = elementDOM.querySelectorAll('[data-mount]')

    renderPlace.forEach(elem => {
      const component = elem.dataset.mount
      const componentInstance = this.#components[component]
      componentInstance.render()
      elem.replaceWith(componentInstance.element)
    })
  }

  setTree(tree = {}) {
    this.#components = tree
  }

  addTreeComponent(componentMarker, component) {
    this.#components[componentMarker] = component
  }

  removeTreeComponent(componentMarker) {
    this.#components[componentMarker] = null
  }

  clearTreeComponents() {
    this.#components = {}
  }
}

class MemoDOM {
  #cache = {}

  get cache() {
    return this.#cache
  }

  clear() {
    this.#cache = {}
  }

  memoizeDocument(elementDOM) {
    if (!elementDOM) return
    const elementNeedCache = elementDOM.querySelectorAll('[data-memo]')

    for (const element of elementNeedCache) {
      const key = element.dataset.memo
      this.#cache[key] = element
    }
  }
}