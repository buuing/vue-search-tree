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
      default: true
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
    _search (val) {
      if (val) return this.deepData = this._getLdqTree(this.deepData)
      const keys = this.getCheckedKeys()
      this.initData()
      this.setCheckedKeys(keys, true)
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
    /**
     * 前序迭代所有节点
     * @param { Array } nodes 将要遍历的节点
     * @param { Function } callback 回调函数如果返回true就终止遍历并返回该节点, 否则继续遍历后面的节点, 最后返回null
     */
    _preorder (nodes, callback) {
      if (!nodes.length) return null
      const { children } = this.defaultProps
      let stack = [...nodes]
      while (stack.length) {
        const curr = stack.shift()
        if (callback(curr)) return curr
        if (curr[children].length) stack.unshift(...curr[children])
      }
      return null
    },
    /**
     * 层序迭代叶子节点
     * @param { Array } nodes 将要遍历的节点
     * @param { Function } callback 回调函数如果返回true就终止遍历并返回该节点, 否则继续遍历后面的节点, 最后返回null
     */
    _levelOrder (nodes, callback) {
      if (!nodes.length) return null
      const { children } = this.defaultProps
      let queue = [...nodes], res = []
      while (queue.length) {
        let len = queue.length
        while (len--) {
          const curr = queue.shift()
          if (curr[children].length) { // 拦截叶子节点
            queue.push(...curr[children])
          } else {
            if (callback(curr)) return curr
          }
        }
      }
      return null
    },
    _initNode (node, parent) { // 初始化节点
      const { name, children, disabled } = this.defaultProps
      const key = node[this.nodeKey]
      this.$set(node, name, node[name] || this.emptyText)
      this.$set(node, children, node[children] || [])
      this.$set(node, disabled, node[disabled] || false)
      this.$set(node, 'visible', true)
      this.$set(node, 'level', parent ? ~~parent.level + 1 : 1)
      this.$set(node, 'checked', Reflect.has(node, 'checked') ? node.checked : (parent && parent.checked) || this.defaultCheckedKeys.indexOf(key) > -1)
      this.$set(node, 'expand', Reflect.has(node, 'expand') ? node.expand : this.defaultExpandAll || this.defaultExpandedKeys.indexOf(key) > -1)
      this.$set(node, '$keys', [])
      this.$set(node, '$sort', 0)
    },
    _initData () { // 初始化数据
      const { children } = this.defaultProps
      const _deep = (arr, parent) => {
        arr.forEach(item => {
          this._initNode(item, parent)
          item[children]?.length && _deep(item[children], item)
          item.expand && parent && (parent.expand = true)
        })
      }
      _deep(this.sourceData)
      this.initData()
    },
    _getLdqTree (tree) { // 获取关键词索引并排序
      const { name, children } = this.defaultProps
      tree.forEach(item => {
        const keys = getDictionary(item[name], this._search)
        item.$keys = keys
        item.$sort = computSortNum(keys)
        if (item[children].length) item[children] = this._getLdqTree(item[children])
        let childrenSort = item[children].reduce((max, item) => max > item.$sort ? max : item.$sort, 0)
        item.$sort += childrenSort
        // 由于不匹配关键词的数据可能很多, 这里折叠未命中的节点
        this._search && (item.expand = !!childrenSort)
      })
      return getSortData(tree)
    },
    _downwardUpdateChecked (data, checked) { // 向下处理树节点的checked
      const { children, disabled } = this.defaultProps
      // 如果当前节点是叶子节点, 只需要判断disabled
      if (!data[children].length) return !data[disabled] && (data.checked = checked)
      // 然后过滤所有叶子节点, 如果全部都是disabled就return
      if (!this._levelOrder(data[children], item => !item[disabled])) return false
      // 最后判断当前节点是否为disable
      !data[disabled] && (data.checked = checked)
      data[children].forEach(item => this._downwardUpdateChecked(item, checked))
    },
    initData () { // 向外暴露一个初始化数据的方法
      const { children } = this.defaultProps
      const data = deepCopy(this.sourceData)
      this._preorder(data, item => !(item.$children = item[children]))
      this.deepData = this._getLdqTree(data)
    },
    getNodeByKey (key) { // 根据key获取对应深拷贝节点
      return deepCopy(this._getNode(key))
    },
    _getNode (key) { // 根据key获取对应引用节点
      return this._preorder(this.deepData, item => item[this.nodeKey] == key)
    },
    resetChecked () { // 取消所有节点的选中状态
      const { disabled } = this.defaultProps
      return !this._levelOrder(this.deepData, item => item.checked = false)
    },
    setCheckedByKeys (keys, checked) { // 设置指定keys节点的checked
      keys = deepCopy(keys)
      this._preorder(this.deepData, item => {
        let index = keys.indexOf(item[this.nodeKey])
        if (index === -1) return false
        this._downwardUpdateChecked(item, checked)
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
    },
    remove (key) { // 删除指定的节点
      const curr = this._getNode(key)
      if (!curr) return !!console.warn('该节点不存在')
      const arr = curr.$pid ? this._getNode(curr.$pid)[this.defaultProps.children] : this.deepData
      arr.splice(arr.findIndex(item => item === curr), 1)
      return true
    },
    append (key, node) { // 添加新的子节点
      const nodeKey = node[this.nodeKey]
      if (!nodeKey) return !!console.warn('新节点没有node-key')
      if (key === null) {
        this._initNode(node, null)
        this.deepData.push(node)
        return true
      }
      if (this._getNode(nodeKey)) return !!console.warn('请勿重复添加新节点, node-key已存在')
      const curr = this._getNode(key)
      if (!curr) return !!console.warn('该节点不存在')
      this._initNode(node, curr)
      curr[this.defaultProps.children].push(node)
      return true
    },
    insertBefore (key, node) { // 向前添加兄弟节点
      const nodeKey = node[this.nodeKey]
      if (!nodeKey) return !!console.warn('新节点没有node-key')
      if (this._getNode(nodeKey)) return !!console.warn('请勿重复添加新节点, node-key已存在')
      const curr = this._getNode(key)
      if (!curr) return !!console.warn('该节点不存在')
      this._initNode(node, curr.$pid)
      const arr = curr.$pid ? this._getNode(curr.$pid)[this.defaultProps.children] : this.deepData
      arr.splice(arr.findIndex(item => item === curr), 0, node)
      return true
    },
    insertAfter (key, node) { // 向后添加兄弟节点
      const nodeKey = node[this.nodeKey]
      if (!nodeKey) return !!console.warn('新节点没有node-key')
      if (this._getNode(nodeKey)) return !!console.warn('请勿重复添加新节点, node-key已存在')
      const curr = this._getNode(key)
      if (!curr) return !!console.warn('该节点不存在')
      this._initNode(node, curr.$pid)
      const arr = curr.$pid ? this._getNode(curr.$pid)[this.defaultProps.children] : this.deepData
      arr.splice(arr.findIndex(item => item === curr) + 1, 0, node)
      return true
    }
  }
}
</script>

<style scoped>
  .ldq-tree {
    user-select: none;
  }
</style>
