/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */

export function sortStrings(arr, param = 'asc') {
  const str = 'АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФФХХЦцЧчШшЩщЪъЫыЬьЭэЮюЯяAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz';
  const mapValue = ((map, str) => {
    for (let i = 0; i < str.length; i++) { map.set(str[i], i) }
    return map;
  })(new Map(), str);

  const factor = { 'asc': 1, 'desc': -1 }
  return [...arr].sort((strA, strB) => {
    const minLength = strA.length < strB.length ? strA.length : strB.length;
    let diff = 0;
    for (let i = 0; i < minLength; i++) {
      const aValue = mapValue.get(strA[i]);
      const bValue = mapValue.get(strB[i]);

      if (Number.isInteger(aValue) && Number.isInteger(bValue)) diff = aValue - bValue;
      if (diff !== 0) return diff * factor[param];
    }
    return diff;
  })
}