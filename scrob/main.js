import './scrollbar.styl'
import { getScrollbarWidth, throttle, handeEvent } from './util'

export default {
  name: 'llScrollbar',

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    throttle: {
      type: Number,
      default: 14
    }
  },

  beforeCreate() {
    this.scrollbarWidth = getScrollbarWidth()
    this.X = this.Y = 0
    this.scrol = { X: 'scrollLeft', Y: 'scrollTop' }
    this.thumb = { X: 'horizontal', Y: 'vertical' }
    this.offset = { X: 'offsetWidth', Y: 'offsetHeight' }
  },

  render(h) {
    const vertical = (<div class='ll-scrollbar__bar vertical' onMousedown = { (e) => this.mousedownHandler(e, 'Y') }>
      <div class='ll-scrollbar__thumb' ref='vertical'></div>
    </div>)

    const horizontal = (<div class='ll-scrollbar__bar horizontal' onMousedown = { (e) => this.mousedownHandler(e, 'X') }>
      <div class='ll-scrollbar__thumb' ref='horizontal'></div>
    </div>)

    return (
      <div class='ll-scrollbar' ref='wrap'>
        <div class='ll-scrollbar__view' ref='view' onScroll = { throttle(this.scroll, this.throttle) }
          style = {{ marginRight: -this.scrollbarWidth + 'px', marginBottom: -this.scrollbarWidth + 'px' }}>
          { h(
            this.tag,
            { ref: 'slot', class: 'll-scrollbar__slot' },
            this.$slots.default
          )}
        </div>
        { [horizontal, vertical] }
      </div>
    )
  },

  mounted() {
    this.init()
  },

  methods: {
    scroll(axis = 'Y') {
      this[axis] = this.$refs.view[this.scrol[axis]] * this['proportion' + axis]
      const transform = document.documentMode === 9 ? '-ms-transform' : 'transform'
      this.$refs[this.thumb[axis]].style[transform] = `translate${axis}(${this[axis]}px)`
      if (axis === 'Y') this.scroll('X')
    },

    mousedownHandler(e, axis) {
      if (e.button === 2) return
      document.selection && document.selection.empty()
      this.axis = axis

      if (e.target.className.indexOf('thumb') > -1) {
        this.start = e['screen' + axis] - this[axis]
        handeEvent('mousemove', this.mousemoveHandler, 1)
      } else {
        this.mousemoveHandler('', e['offset' + axis] - this.$refs[this.thumb[axis]][this.offset[axis]] / 2)
      }
      handeEvent('mouseup', this.mouseupHandler, 1)
    },

    mousemoveHandler(e, scroll, axis = this.axis) {
      this.$refs.view[this.scrol[axis]] = (scroll !== undefined ? scroll : e['screen' + axis] - this.start) / this['proportion' + axis]
    },

    init() {
      let view = this.$refs.view
      // 兼容ie9、10 不支持flex布局，ie11 在有max-height下高度无法自适应
      const { clientHeight } = this.$refs.wrap
      const { scrollTop, style } = view
      style.height = ''
      if (clientHeight !== view.clientHeight) {
        style.height = clientHeight + this.scrollbarWidth + 'px'
        view.scrollTop = scrollTop
      }

      this.thumbInit(view.clientHeight, view.scrollHeight, 'Y')
      this.thumbInit(view.clientWidth, view.scrollWidth, 'X')
      this.scroll()
    },

    thumbInit(client, scroll, axis) {
      let thumb = this.$refs[this.thumb[axis]]
      let { style } = thumb
      if (client < scroll) {
        style.display = ''
        style[axis === 'X' ? 'width' : 'height'] = client / scroll * client + 'px'
        this['proportion' + axis] = (client - thumb[[this.offset[axis]]]) / (scroll - client)
      } else {
        style.display = 'none'
      }
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
