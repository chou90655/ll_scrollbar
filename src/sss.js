import '../css/zh-scrollbar.less'
import { getScrollbarWidth, throttle, handeEvent } from './util'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  name: 'Scrollbar',

  props: {
    tag: { type: String, default: 'div' },
    throttle: { type: Number, default: 14 },
    isObserver: Boolean
  },

  beforeCreate() {
    this.scrollbarWidth = getScrollbarWidth()
    this.axis = 'Y'
    this.X = this.Y = 0
    this.scrollAxis = { X: 'scrollLeft', Y: 'scrollTop' }
    this.thumb = { X: 'vertical', Y: 'horizontal' }
  },

  render(h) {
    return (<div class='zh-scrollbar' ref='wrap'>
      <div class='zh-scrollbar__view' ref='view' onScroll= { throttle(this.scroll, this.throttle) } style={{ marginRight: -this.scrollbarWidth + 'px', marginBottom: -this.scrollbarWidth + 'px' }}>
        { h(this.tag, { ref: 'slot', class: 'zh-scrollbar__slot' }, this.$slots.default) }
      </div>
      <div class='zh-scrollbar__bar vertical' onMousedown = { (e) => this.mousedownHandler(e, 'X') }><div class='zh-scrollbar__thumb' ref = 'vertical'></div></div>
      <div class='zh-scrollbar__bar horizontal' onMousedown = { (e) => this.mousedownHandler(e, 'Y') }><div class='zh-scrollbar__thumb' ref = 'horizontal'></div></div>
    </div>)
  },

  mounted() {
    if (this.isObserver) {
      this.ro = new ResizeObserver(throttle(this.init, this.throttle))
      this.ro.observe(this.$refs.slot)
    } else this.init()
  },

  methods: {
    scroll(axis = this.axis) {
      this[axis] = this.$refs.view[this.scrollAxis[axis]] * this['proportion' + axis]
      this.$refs[this.thumb[axis]].style[document.documentMode === 9 ? '-ms-transform' : 'transform'] = 'translate' + axis + '(' + this[axis] + 'px)'
      if (this.$refs.view.scrollLeft * this.proportionX < this.X) this.scroll('X')
    },

    mousedownHandler(e, axis) {
      if (e.button === 2) return
      document.selection && document.selection.empty()
      this.axis = axis
      if (e.target.className.indexOf('thumb') !== -1) {
        this.start = e['screen' + axis] - this[axis]
        handeEvent('mousemove', this.mousemoveHandler, 1)
      } else this.$refs.view[this.scrollAxis[axis]] = (e['offset' + axis] - this.$refs[this.thumb[axis]][axis === 'X' ? 'offsetWidth' : 'offsetHeight'] / 2) / this['proportion' + axis]
      handeEvent('mouseup', this.mouseupHandler, 1)
    },

    mousemoveHandler(e) {
      this.$refs.view[this.scrollAxis[this.axis]] = (e['screen' + this.axis] - this.start) / this['proportion' + this.axis]
    },

    init() {
      let vertical = this.$refs.vertical
      let horizontal = this.$refs.horizontal
      let view = this.$refs.view
      const { offsetHeight } = this.$refs.wrap
      const { scrollTop, clientHeight: clientH, style } = view
      style.height = ''
      if (offsetHeight !== clientH) {
        style.height = offsetHeight + this.scrollbarWidth + 'px'
        view.scrollTop = scrollTop
      }
      const { clientHeight, scrollHeight, clientWidth, scrollWidth } = view
      if (clientHeight < scrollHeight) {
        horizontal.style.height = clientHeight / scrollHeight * clientHeight + 'px'
        this.proportionY = (clientHeight - horizontal.offsetHeight) / (scrollHeight - clientHeight)
        this.scroll()
      } else horizontal.style.height = ''
      if (clientWidth < scrollWidth) {
        vertical.style.width = clientWidth / scrollWidth * clientWidth + 'px'
        this.proportionX = (clientWidth - vertical.offsetWidth) / (scrollWidth - clientWidth)
        this.scroll('X')
      } else vertical.style.width = ''
    },

    mouseupHandler() {
      this.axis = 'Y'
      handeEvent('mouseup', this.mouseupHandler)
      handeEvent('mousemove', this.mousemoveHandler)
    }
  },

  updated() {
    this.isObserver || this.init()
  },

  beforeDestroy() {
    this.ro && this.ro.disconnect()
  }
}
