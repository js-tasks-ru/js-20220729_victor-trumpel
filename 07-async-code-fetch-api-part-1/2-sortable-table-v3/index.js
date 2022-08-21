import fetchJson from './utils/fetch-json.js'
import createDomElement from './utils/createDomElement'
import MemoDOM from './MemoDom'
import TableTemplate from './TableTemplate.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable extends TableTemplate {
  constructor(headersConfig, {
    data = [],
    sorted = {}
  } = {}) {
    
  }

  sortOnClient (id, order) {

  }

  sortOnServer (id, order) {

  }
}
