/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  return [...string].reduce((accStr, currentStr) => {
    const { str } = accStr;
    if (str[str.length - 1] !== currentStr) accStr.counter = 0;
    if (str[str.length - 1] === currentStr) accStr.counter += 1;
    if (!(accStr.counter >= size)) accStr.str += currentStr
    return accStr
  }, {
    str: '',
    counter: 0
  }).str
}
