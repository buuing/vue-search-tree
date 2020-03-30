<script>
import expandImg from './img/expand.svg'
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
    console.log(this.root.props)
    this.$set(data, 'expand', false)
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
        <img src={expandImg} onClick={e => data.expand = !data.expand} style={{
          transform: `rotate(${data.expand ? '0' : '-90'}deg)`,
          visibility: data?.children?.length ? 'visible' : 'hidden'
        }} />
        { root.showCheckbox && <input v-model={data.checked} onChange={e => {
          this.downwardUpdateChecked(data)
        }} type="checkbox" class="tree-checkbox point" /> }
        <p class="tree-name point" onClick={e => root.$emit('click-item', data)}>
          { root.$scopedSlots.default ? root.$scopedSlots.default(data) : data?.keys?.length ? data.name.split('').map(
              (curr, i) => <span style={{ color: data.keys.indexOf(i) > -1 ? 'red': '#666' }}>{curr}</span>
            ) : <span style={{ color: '#666' }}>{data.name}</span>
          }
        </p>
      </li>
      { !!data?.children?.length && (data.expand || root.defaultExpandAll) && data.children.map(item => <search-node key={item.id} data={item}></search-node>) }
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
