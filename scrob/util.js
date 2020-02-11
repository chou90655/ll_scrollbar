export const getScrollbarWidth = () => {
  let scrollDiv = document.createElement('div')
  scrollDiv.style.cssText = 'width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;'
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth
}

export const throttle = (fn, wait) => {
  let previous = 0
  let timeout = null
  return function() {
    let now = +new Date()
    if (timeout) clearTimeout(timeout)
    if (now - previous >= wait) {
      previous = now
      fn()
    } else {
      timeout = setTimeout(() => {
        fn()
        timeout = null
        previous = +new Date()
      }, wait - now + previous)
    }
  }
}

export const handeEvent = (event, fn, type) => {
  window[(type ? 'add' : 'remove') + 'EventListener'](event, fn)
}
