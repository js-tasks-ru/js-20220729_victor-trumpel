export default function createDomElement(strHTML = "") {
  const fragment = document.createElement("div")
  fragment.innerHTML = strHTML
  return fragment.firstElementChild
}