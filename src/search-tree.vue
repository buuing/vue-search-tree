<script>
import searchNode from './search-node.vue'
import { computSortNum, getSortData, getDictionary, deepCopy } from './utils.js'
export default {
  name: 'search-tree',
  components: { searchNode },
  props: {
    data: {              // 源数据
      type: Array,
      required: true
    },
    nodeKey: {           // 指定的id值
      type: String,
      default: 'id'
    },
    props: {             // 配置项
      type: Object,
      default: {
        name: 'name',
        children: 'children'
      }
    },
    showCheckbox: {      // 是否显示checkbox
      type: Boolean,
      default: false
    },
    search: {            // 模糊搜索关键词
      type: String,
      default: ''
    },
    defaultExpandAll: {  // 默认展开全部节点
      type: Boolean,
      default: false
    },
    expandOnClickNode: { // 点击节点时是否展开或折叠
      type: Boolean,
      default: true
    },
    checkOnClickNode: {  // 点击节点时是否选中节点
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      deepData: '',
      sourceData: '',
      isTree: true
    }
  },
  computed: {
    _search () {
      return this.search.trim()
    }
  },
  watch: {
    _search (newVal, oldVal) {
      this.deepData = this._getLdqTree(this.deepData)
    }
  },
  created () {
    this.sourceData = deepCopy(this.data)
    this.deepData = this._getLdqTree(this.sourceData)
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item[this.nodeKey]} data={item}></search-node>) }
    </div>
  },
  methods: {
    _getLdqTree (tree) {
      if (!this._search.trim()) return this.sourceData
      const { name, children } = this.props
      tree = deepCopy(tree)
      tree.forEach(item => {
        const keys = getDictionary(item[name], this._search)
        this.$set(item, '$keys', keys)
        this.$set(item, '$sort', computSortNum(keys))
        if (item[children] && item[children].length) {
          item[children] = this._getLdqTree(item[children])
          item.$sort += item[children].reduce((max, item) => max > item.$sort ? max : item.$sort, 0)
        }
      })
      return getSortData(tree)
    },
    getNode (key) { // 根据key获取对应节点
      const { name, children } = this.props
      let curr = null
      const _deep = data => {
        return data.some(item => {
          if (item[children] && item[children].length && _deep(item[children])) return true
          if (item[this.nodeKey] != key) return false
          return curr = item
        })
      }
      _deep(this.deepData)
      return deepCopy(curr)
    },
    resetChecked () { // 取消所有节点的选中状态
      const { name, children } = this.props
      const _deep = data => {
        return data.forEach(item => {
          this.$set(item, 'checked', false)
          item[children] && item[children].length && _deep(item[children])
        })
      }
      _deep(this.deepData)
      return true
    },
    setCheckedKeys (keys, checked) { // 设置指定keys节点的checked
      const { name, children } = this.props
      keys = deepCopy(keys)
      const _deep = data => {
        return data.some(item => {
          if (item[children] && item[children].length) return !!_deep(item[children])
          let index = keys.indexOf(item[this.nodeKey])
          if (index === -1) return false
          this.$set(item, 'checked', checked)
          keys.splice(index, 1)
          if (!keys.length) return true
          else return false
        })
      }
      return _deep(this.deepData)
    },
    getCheckedKeys () { // 获取所有选中节点的keys
      const { name, children } = this.props
      const _deep = data => {
        const ids = []
        data.forEach(item => {
          if (item[children] && item[children].length) {
            ids.push(..._deep(item[children]))
          } else {
            item.checked && ids.push(item[this.nodeKey])
          }
        })
        return ids
      }
      return _deep(this.deepData)
    },
  }
}
</script>

<style scoped>
  .ldq-tree {
    user-select: none;
  }
</style>
