import '../css/zh-scrollbar.less'
import { getScrollbarWidth, throttle, handeEvent } from './util'
import ResizeObserver from 'resize-observer-polyfill'

export default {
  name: 'Scrollbar',

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    throttle: {
      type: Number,
      default: 14
    },
    isObserver: Boolean
  },

  beforeCreate() {
    this.scrollbarWidth = getScrollbarWidth()
    this.X = this.Y = 0
    this.scrollAxis = { X: 'scrollLeft', Y: 'scrollTop' }
    this.thumb = { X: 'vertical', Y: 'horizontal' }
  },

  render(h) {
    const horizontal = (<div class='zh-scrollbar__bar horizontal' onMousedown = { (e) => this.mousedownHandler(e, 'Y') }>
      <div class='zh-scrollbar__thumb' ref='horizontal'></div>
    </div>)

    const vertical = (<div class='zh-scrollbar__bar vertical' onMousedown = { (e) => this.mousedownHandler(e, 'X') }>
      <div class='zh-scrollbar__thumb' ref='vertical'></div>
    </div>)

    return (
      <div class='zh-scrollbar' ref='wrap'>
        <div class='zh-scrollbar__view' ref='view' onScroll = { throttle(this.scroll, this.throttle) }
          style = {{ marginRight: -this.scrollbarWidth + 'px', marginBottom: -this.scrollbarWidth + 'px' }}>
          { h(
            this.tag,
            { ref: 'slot', class: 'zh-scrollbar__slot' },
            this.$slots.default
          )}
        </div>
        { [horizontal, vertical] }
      </div>
    )
  },

  mounted() {
    if (this.isObserver) {
      this.ro = new ResizeObserver(throttle(this.init, this.throttle))
      this.ro.observe(this.$refs.slot)
      this.ro.observe(this.$refs.wrap)
    } else this.init()
  },

  methods: {
    scroll(axis = 'Y') {
      this[axis] = this.$refs.view[this.scrollAxis[axis]] * this['proportion' + axis]
      const transform = document.documentMode === 9 ? '-ms-transform' : 'transform'
      this.$refs[this.thumb[axis]].style[transform] = `translate${axis}(${this[axis]}px)`
      if (axis === 'Y') this.scroll('X')
    },

    mousedownHandler(e, axis) {
      if (e.button === 2) return
      document.selection && document.selection.empty()
      this.axis = axis

      if (e.target.className.indexOf('thumb') === -1) {
        this.mousemoveHandler('', e['offset' + axis] - this.$refs[this.thumb[axis]][axis === 'X' ? 'offsetWidth' : 'offsetHeight'] / 2)
      } else {
        this.start = e['screen' + axis] - this[axis]
        handeEvent('mousemove', this.mousemoveHandler, 1)
      }
      handeEvent('mouseup', this.mouseupHandler, 1)
    },

    mousemoveHandler(e, scroll, axis = this.axis) {
      this.$refs.view[this.scrollAxis[axis]] = (scroll !== undefined ? scroll : e['screen' + axis] - this.start) / this['proportion' + axis]
    },

    init() {
      let view = this.$refs.view
      let horizontal = this.$refs.horizontal
      let vertical = this.$refs.vertical
      // 兼容ie9、10 不支持flex布局，ie11 在有max-height下高度无法自适应
      const { offsetHeight } = this.$refs.wrap
      const { scrollTop, style, clientHeight: clientH } = view
      style.height = ''
      if (offsetHeight !== clientH) {
        style.height = offsetHeight + this.scrollbarWidth + 'px'
        view.scrollTop = scrollTop
      }

      const { clientHeight, scrollHeight, clientWidth, scrollWidth } = view
      let hStyle = horizontal.style
      let vStyle = vertical.style
      if (clientHeight < scrollHeight) {
        hStyle.display = ''
        hStyle.height = clientHeight / scrollHeight * clientHeight + 'px'
        this.proportionY = (clientHeight - horizontal.offsetHeight) / (scrollHeight - clientHeight)
      } else {
        hStyle.display = 'none'
      }

      if (clientWidth < scrollWidth) {
        vStyle.display = ''
        vStyle.width = clientWidth / scrollWidth * clientWidth + 'px'
        this.proportionX = (clientWidth - vertical.offsetWidth) / (scrollWidth - clientWidth)
      } else {
        vStyle.display = 'none'
      }
      this.scroll()
    },

    mouseupHandler() {
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
