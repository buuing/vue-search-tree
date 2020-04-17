<script>
import { deepCopy } from './utils.js'
import zCheckbox from './z-checkbox.vue'
export default {
  name: 'search-node',
  components: { zCheckbox },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      root: null,
      children: [],
      indeterminate: false
    }
  },
  created () {
    const { data } = this
    const parent = this.$parent
    this.root = parent.isTree ? parent : parent.root
    this.$set(this.data, '$pid', parent.isTree ? null : parent.data[this.root.nodeKey])
  },
  watch: {
    'data.$children': {
      handler (newVal, old) {
        const parentNode = !this.$parent.isTree && this.$parent
        const len = newVal.length
        const number = newVal.reduce((num, item) => num += +item.checked, 0)
        this.indeterminate = !!number && number !== len
        this.data.checked = (!old.length && this.data.checked) || (!!len && number === len)
      },
      deep: true
    }
  },
  render () {
    const { data, root } = this
    const { name, children, disabled } = root.defaultProps
    return <ul class="tree-ul">
      <li class="tree-li">
        <svg t="1585220115926" class="tree-icon point" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2222" width="10" height="10" style={{
          transform: `rotate(${data.expand ? '0' : '-90'}deg)`,
          visibility: data[children].length ? 'visible' : 'hidden'
        }} onClick={e => this.handlerExpand(e)}>
          <path d="M151.476947 199.553918l718.53082 0c39.763632 0 71.922053 31.909757 71.922053 71.675436 0 18.485003-7.095605 35.205826-18.486026 47.872311L568.114019 793.227056c-23.810289 31.400151-68.641333 37.993313-100.29731 14.183024-5.570879-4.052293-10.384511-8.873088-14.183024-14.190187L94.235245 314.041416c-23.547299-31.407314-17.217127-76.479859 14.436804-100.041484 12.922311-9.881045 27.864628-14.43885 42.804898-14.43885l0 0L151.476947 199.553918zM151.476947 199.553918" p-id="2223" fill="#c0c4cc"></path>
        </svg>
        { root.showCheckbox && <zCheckbox value={data.checked} disabled={data[disabled]} indeterminate={this.indeterminate} onChange={e => this.handlerChecked(e)} class="tree-checkbox point"></zCheckbox> }
        <div class="tree-content point" onClick={e => {
          root.expandOnClickNode && this.handlerExpand(e)
          root.checkOnClickNode && this.handlerChecked(e)
          root.$emit('node-click', e, deepCopy(data))
        }}>
          { root.$scopedSlots.default ? root.$scopedSlots.default(data) : <p class="tree-text">
            { data.$keys?.length ? data[name].split('').map(
              (curr, i) => <span style={{ color: data.$keys.indexOf(i) > -1 ? 'red': '#666' }}>{curr}</span>
            ) : <span style={{ color: '#666' }}>{data[name]}</span> }
          </p> }
        </div>
      </li>
      { !!data[children].length && data.expand && data[children].map(item => <search-node key={item[root.nodeKey]} data={item}></search-node>) }
    </ul>
  },
  methods: {
    handlerChecked (e) {
      const { data, root } = this
      const { disabled } = root.defaultProps
      if (data[disabled]) return false
      data.checked = this.indeterminate || !data.checked
      this.root._downwardUpdateChecked(data, data.checked)
      root.$emit('node-checked', e, deepCopy(data))
    },
    handlerExpand (e) {
      const { data, root } = this
      data.expand = !data.expand
      root.$emit('node-expand', e, deepCopy(data))
    },
  }
}
</script>

<style scoped>
  .tree-ul {
    margin: 0;
    padding: 0 0 0 15px;
  }
  .tree-li {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
  }
  .tree-checkbox {
    margin: 0 0 0 4px;
    transform: translateY(1px);
  }
  .tree-content {
    width: 100%;
    margin: 0 0 0 3px;
  }
  .tree-content p {
    margin: 0;
  }
  .tree-text {
    margin: 0;
  }
  .point {
    cursor: pointer;
  }
</style>
