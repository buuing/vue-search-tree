<script>
import searchNode from './search-node.vue'
import { computSortNum, getSortData, getDictionary, deepCopy } from './utils.js'
export default {
  name: 'search-tree',
  components: { searchNode },
  props: {
    data: {                // 源数据
      type: Array,
      required: true
    },
    nodeKey: {             // 指定的id值
      type: String,
      default: 'id'
    },
    props: {               // 配置项
      type: Object,
      default: {
        name: 'name',
        children: 'children'
      }
    },
    search: {              // 模糊搜索关键词
      type: String,
      default: ''
    },
    emptyText: {           // 内容为空时展示的文本
      type: String,
      default: ''
    },
    showCheckbox: {        // 是否显示checkbox
      type: Boolean,
      default: false
    },
    defaultExpandAll: {    // 默认展开全部节点
      type: Boolean,
      default: false
    },
    expandOnClickNode: {   // 点击节点时是否展开或折叠
      type: Boolean,
      default: true
    },
    checkOnClickNode: {    // 点击节点时是否选中节点
      type: Boolean,
      default: false
    },
    defaultExpandedKeys: { // 默认展开节点的keys
      type: Array,
      default: () => []
    },
    defaultCheckedKeys: {  // 默认选中节点的keys
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      deepData: '',
      isTree: true
    }
  },
  computed: {
    _search () {
      return this.search.trim()
    },
    sourceData () {
      return deepCopy(this.data)
    }
  },
  watch: {
    sourceData () {
      this._initData()
    },
    _search (newVal) {
      console.log(!!newVal)
      this.deepData = newVal ? this._getLdqTree(this.deepData) : deepCopy(this.sourceData)
    }
  },
  created () {
    this._initData()
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item[this.nodeKey]} data={item}></search-node>) }
    </div>
  },
  methods: {
    _initData () {
      const { name, children } = this.props
      this._preorder(this.sourceData, item => {
        const key = item[this.nodeKey]
        item.checked = !!item.checked || this.defaultCheckedKeys.indexOf(key) > -1
        item.expand = !!item.expand || this.defaultExpandAll || this.defaultExpandedKeys.indexOf(key) > -1
        item.$keys = []
        item.$sort = 0
        !item[name] && (item[name] = this.emptyText)
        !item[children] && (item[children] = [])
      })
      this.deepData = this._getLdqTree(deepCopy(this.sourceData))
    },
    _preorder (arr, callback) { // 前序迭代遍历
      const { children } = this.props
      let stack = [...arr]
      while (stack.length) {
        const curr = stack.shift()
        if (callback(curr)) return curr
        if (curr[children].length) stack.unshift(...curr[children])
      }
      return null
    },
    _getLdqTree (tree) {
      const { name, children } = this.props
      tree.forEach(item => {
        const keys = getDictionary(item[name], this._search)
        item.$keys = keys
        item.$sort = computSortNum(keys)
        if (item[children].length) item[children] = this._getLdqTree(item[children])
        item.$sort += item[children].reduce((max, item) => max > item.$sort ? max : item.$sort, 0)
      })
      return getSortData(tree)
    },
    getNode (key) { // 根据key获取对应节点
      return deepCopy(this._preorder(this.deepData, item => item[this.nodeKey] == key))
    },
    resetChecked () { // 取消所有节点的选中状态
      return !this._preorder(this.deepData, item => !!this.$set(item, 'checked', false))
    },
    setCheckedKeys (keys, checked) { // 设置指定keys节点的checked
      keys = deepCopy(keys)
      this._preorder(this.deepData, item => {
        let index = keys.indexOf(item[this.nodeKey])
        if (index === -1) return false
        this.$set(item, 'checked', checked)
        keys.splice(index, 1)
        return !keys.length
      })
    },
    getCheckedKeys () { // 获取所有选中节点的keys
      const keys = []
      this._preorder(this.deepData, item => item.checked && !keys.push(item[this.nodeKey]))
      return keys
    },
    getCheckedNodes () { // 获取所有选中节点的nodes
      const nodes = []
      this._preorder(this.deepData, item => item.checked && !nodes.push(item))
      return nodes
    }
  }
}
</script>

<style scoped>
  .ldq-tree {
    user-select: none;
  }
</style>
