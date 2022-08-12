/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const record = [];
  new Set(arr).forEach((v) => record.push(v));
  return record;
}
