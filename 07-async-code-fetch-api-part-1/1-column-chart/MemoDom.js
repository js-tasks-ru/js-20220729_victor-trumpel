export default class MemoDOM {
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