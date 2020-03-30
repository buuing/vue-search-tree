<script>
import { deepCopy } from './utils.js'
export default {
  name: 'search-node',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      root: null
    }
  },
  created () {
    const { data } = this
    const parent = this.$parent
    this.root = parent.isTree ? parent : parent.root
    this.$set(data, 'expand', !!this.root.defaultExpandAll)
    !data.children && (data.children = [])
  },
  watch: {
    'data.children': {
      handler (newVal) {
        newVal?.length && this.$set(this.data, 'checked', newVal.every(item => item.checked))
      },
      deep: true
    }
  },
  render () {
    const { data, root } = this
    return <ul class="tree-ul">
      <li class="tree-li">
        <svg t="1585220115926" class="tree-icon point" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2222" width="10" height="10" style={{
          transform: `rotate(${data.expand ? '0' : '-90'}deg)`,
          visibility: data?.children?.length ? 'visible' : 'hidden'
        }} onClick={e => data.expand = !data.expand}>
          <path d="M151.476947 199.553918l718.53082 0c39.763632 0 71.922053 31.909757 71.922053 71.675436 0 18.485003-7.095605 35.205826-18.486026 47.872311L568.114019 793.227056c-23.810289 31.400151-68.641333 37.993313-100.29731 14.183024-5.570879-4.052293-10.384511-8.873088-14.183024-14.190187L94.235245 314.041416c-23.547299-31.407314-17.217127-76.479859 14.436804-100.041484 12.922311-9.881045 27.864628-14.43885 42.804898-14.43885l0 0L151.476947 199.553918zM151.476947 199.553918" p-id="2223" fill="#c0c4cc"></path>
        </svg>
        { root.showCheckbox && <input v-model={data.checked} onChange={e => {
          this.downwardUpdateChecked(data)
        }} type="checkbox" class="tree-checkbox point" /> }
        <p class="tree-name point" onClick={e => root.$emit('click-item', deepCopy(data))}>
          { root.$scopedSlots.default ? root.$scopedSlots.default(data) : (data.keys?.length ? data.name.split('').map(
              (curr, i) => <span style={{ color: data.keys.indexOf(i) > -1 ? 'red': '#666' }}>{curr}</span>
            ) : <span style={{ color: '#666' }}>{data.name}</span>)
          }
        </p>
      </li>
      { !!data?.children?.length && data.expand && data.children.map(item => <search-node key={item.id} data={item}></search-node>) }
    </ul>
  },
  methods: {
    downwardUpdateChecked (data) {
      data?.children?.length && data.children.forEach(item => {
        this.$set(item, 'checked', data.checked)
        this.downwardUpdateChecked(item)
      })
    }
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
    margin: 0 3px 0 4px;
    transform: translateY(1px);
  }
  .tree-name {
    margin: 0;
  }
  .point {
    cursor: pointer;
  }
</style>
