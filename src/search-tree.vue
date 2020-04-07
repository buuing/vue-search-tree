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
    },
    props: {               // 配置项
      type: Object,
      default: () => {
        return {}
      }
    },
  },
  data () {
    return {
      deepData: '',
      isTree: true,
      defaultProps: {}
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
    _search () {
      this.deepData = this._getLdqTree(this.deepData)
    }
  },
  created () {
    this.defaultProps = {
      name: this.props.name || 'name',
      children: this.props.children || 'children',
      disabled: this.props.disabled || 'disabled'
    }
    this._initData()
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item[this.nodeKey]} data={item}></search-node>) }
    </div>
  },
  methods: {
    _initData () { // 初始化数据
      const { name, children, disabled } = this.defaultProps
      const _deep = (arr, parent) => {
        arr.forEach(item => {
          const key = item[this.nodeKey]
          item.$keys = []
          item.$sort = 0
          item.level = parent ? ~~parent.level + 1 : 1
          item.checked = (parent && parent.checked === true) || this.defaultCheckedKeys.indexOf(key) > -1
          item.expand = this.defaultExpandAll || this.defaultExpandedKeys.indexOf(key) > -1
          !Reflect.has(item, disabled) && (item[disabled] = false)
          !item[name] && (item[name] = this.emptyText)
          !item[children] && (item[children] = [])
          item[children].length && _deep(item[children], item)
          item.expand && parent && (parent.expand = true)
        })
      }
      _deep(this.sourceData)
      this.deepData = this._getLdqTree(deepCopy(this.sourceData))
    },
    _getLdqTree (tree) { // 获取关键词索引并排序
      const { name, children } = this.defaultProps
      tree.forEach(item => {
        const keys = getDictionary(item[name], this._search)
        item.$keys = keys
        item.$sort = computSortNum(keys)
        if (item[children].length) item[children] = this._getLdqTree(item[children])
        item.$sort += item[children].reduce((max, item) => max > item.$sort ? max : item.$sort, 0)
      })
      return getSortData(tree)
    },
    _preorder (arr, callback) { // 前序迭代遍历
      if (!arr.length) return null
      const { children } = this.defaultProps
      let stack = [...arr]
      while (stack.length) {
        const curr = stack.shift()
        if (callback(curr)) return curr
        if (curr[children].length) stack.unshift(...curr[children])
      }
      return null
    },
    _downwardUpdateChecked (data) {
      const { name, children } = this.defaultProps
      data[children].forEach(item => {
        item.checked = data.checked
        this._downwardUpdateChecked(item)
      })
    },
    ininData () { // 向外暴露一个初始化数据的方法
      this.deepData = this._getLdqTree(deepCopy(this.sourceData))
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
        item.checked = checked
        this._downwardUpdateChecked(item)
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
      return deepCopy(nodes)
    }
  }
}
</script>

<style scoped>
  .ldq-tree {
    user-select: none;
  }
</style>
