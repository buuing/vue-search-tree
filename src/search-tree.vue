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
    hideMisses: {          // 是否隐藏模糊搜索不匹配的节点
      type: Boolean,
      default: true
    },
    expandMisses: {        // 是否展开模糊搜索不匹配的节点
      type: Boolean,
      default: false
    },
    searchDebounce: {      // 输入关键词防抖
      type: Number,
      default: 500
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
    clearRecovery: {       // 清空搜索关键词时, 是否复原排序顺序
      type: Boolean,
      default: false
    },
    props: {               // 配置项
      type: Object,
      default: () => {
        return {}
      }
    },
    filterNode: {          // 过滤节点的方法
      type: Function,
      default: function () {
        return true
      }
    }
  },
  data () {
    return {
      deepData: '',
      isTree: true,
      defaultProps: {},
      timer: null,
    }
  },
  computed: {
    _search () {
      return this.search.trim()
    },
    sourceData () {
      if (Object.prototype.toString.call(this.data) !== '[object Array]') {
        return console.error('data属性必须为数组')
      }
      return deepCopy(this.data)
    }
  },
  watch: {
    sourceData () {
      this._initData()
    },
    _search (val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(_ => {
        if (val || !this.clearRecovery) return this.deepData = this._getLdqTree(this.deepData)
        /**
         * 如果清空搜索关键词时, 开启了复原初始结构 clearRecovery = true 时
         * 经测试 4k+ 的单一树节点卡顿在15秒左右, 建议分散处理可以降到2秒左右
         */
        const keys = this.showCheckbox ? this.getCheckedKeys() : []
        this.deepData = deepCopy(this.sourceData)
        this.setCheckedByKeys(keys, true)
      }, this.searchDebounce)
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
      this.$set(node, 'checked', Reflect.has(node, 'checked') ? node.checked : (parent && parent.checked) || this.defaultCheckedKeys.includes(key))
      this.$set(node, 'indeterminate', false)
      this.$set(node, 'expand', Reflect.has(node, 'expand') ? node.expand : this.defaultExpandAll || this.defaultExpandedKeys.includes(key))
      this.$set(node, '$keys', [])
      this.$set(node, '$sort', 0)
    },
    _initData () { // 初始化数据
      const { children } = this.defaultProps
      const _deep = (arr, parent) => {
        let checkedNum = 0, anyOne = false
        arr.forEach(item => {
          this._initNode(item, parent)
          checkedNum += +item.checked
          item[children].length && _deep(item[children], item)
          item.expand && parent && (parent.expand = true)
          if (item.indeterminate) anyOne = true
        })
        if (parent) {
          // 子节点是否全选 || 子节点的叶子节点全部选中
          parent.checked = checkedNum === arr.length || !this._levelOrder(arr, item => !item.checked)
          // 子节点有一个是半选 || 被选中的节点不为零并且被选中的节点不等于子节点长度 || 该节点不是全选并且子节点中任意一个被选中
          parent.indeterminate = anyOne || (!!checkedNum && checkedNum != arr.length) || (!parent.checked && !!this._preorder(arr, item => item.checked))
        }
      }
      _deep(this.sourceData)
      const data = deepCopy(this.sourceData)
      this.deepData = this._getLdqTree(data)
    },
    _getLdqTree (tree) { // 获取关键词索引并排序
      const { name, children } = this.defaultProps
      tree.forEach(item => {
        if (this._search) {
          const keys = getDictionary(item[name], this._search)
          item.$keys = keys
          item.$sort = computSortNum(keys)
          if (item[children].length) item[children] = this._getLdqTree(item[children])
          let childrenSort = item[children].reduce((max, item) => max > item.$sort ? max : item.$sort, 0)
          item.$sort += childrenSort
          // 是否隐藏未命中节点
          item.visible = !!item.$sort
          // 由于不匹配关键词的数据可能很多, 这里折叠未命中的节点
          !this.expandMisses && (item.expand = !!childrenSort)
        } else {
          item.$keys = []
          item.$sort = 0
          item.visible = true
          item.expand = this.defaultExpandAll || this.defaultExpandedKeys.indexOf(item[this.nodeKey]) > -1
          if (item[children].length) item[children] = this._getLdqTree(item[children])
        }
      })
      return getSortData(tree)
    },
    _downwardUpdateChecked (data, checked) { // 向下处理树节点的checked
      const { children, disabled } = this.defaultProps
      // 如果当前节点是叶子节点, 只需要判断disabled即可
      if (!data[children].length) return !data[disabled] && (data.checked = checked)
      // 提前声明变量来合并多次层序遍历
      let allNodeIsDisabled = true,
        oneNodeIsDisabledAndChecked = false,
        oneNodeIsDisabledAndUncheck = false
      // 遍历所有叶子节点
      this._levelOrder(data[children], item => {
        if (!item[disabled]) allNodeIsDisabled = false
        if (item[disabled] && item.checked) oneNodeIsDisabledAndChecked = true
        if (item[disabled] && !item.checked) oneNodeIsDisabledAndUncheck = true
      })
      // 如果所有叶子节点都是disabled就提前打断逻辑
      if (allNodeIsDisabled) return false
      /**
       * 如果有一个叶子节点是disabled并且checked=false, 那么该节点只有半选和全不选两种状态
       * 如果有一个叶子节点是disabled并且checked=true, 那么该节点只有半选和全选两种状态
       */
      data.indeterminate = checked ? oneNodeIsDisabledAndUncheck : oneNodeIsDisabledAndChecked
      // 默认情况和oneNodeIsDisabledAndChecked时
      data.checked = checked
      // 由于两种状态可能叠加存在, 所以oneNodeIsDisabledAndUncheck的判断放在后面
      if (oneNodeIsDisabledAndUncheck) data.checked = false
      // 可以向下继续遍历
      data[children].forEach(item => this._downwardUpdateChecked(item, checked))
    },
    getNodeByKey (key) { // 根据key获取对应深拷贝节点
      return deepCopy(this._getNode(key))
    },
    _getNode (key) { // 根据key获取对应引用节点
      return this._preorder(this.deepData, item => item[this.nodeKey] == key)
    },
    resetChecked () { // 取消所有节点的选中状态
      return !this._preorder(this.deepData, item => (item.checked = false, item.indeterminate = false))
    },
    setCheckedByKeys (keys, checked) { // 设置指定keys节点的checked
      if (!keys.length) return null
      keys = deepCopy(keys)
      this._preorder(this.deepData, item => {
        let index = keys.indexOf(item[this.nodeKey])
        if (index === -1) return false
        this._downwardUpdateChecked(item, checked)
        keys.splice(index, 1)
        return !keys.length
      })
    },
    getCheckedKeys (nodeKey = this.nodeKey) { // 获取所有选中节点的keys
      const keys = []
      this._preorder(this.deepData, item => item.checked && !keys.push(item[nodeKey]))
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
    },
    getTotalOfNodes (callback = node => true) {
      let n = 0
      this._preorder(this.sourceData, node => callback(deepCopy(node)) && n++ && false)
      return n
    }
  }
}
</script>

<style scoped>
  .ldq-tree {
    user-select: none;
  }
</style>
