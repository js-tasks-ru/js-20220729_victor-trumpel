export default function createDomElement(strHTML = "") {
  const wrapper = document.createElement("div")
  wrapper.innerHTML = strHTML
  return wrapper.firstElementChild
}