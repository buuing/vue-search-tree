<script>
import searchNode from './search-node.vue'
import { computSortNum, getSortData, getDictionary, deepCopy } from './utils.js'
export default {
  name: 'search-tree',
  components: { searchNode },
  props: {
    data: {             // 源数据
      type: Array,
      required: true
    },
    nodeKey: {          // 指定的id值
      type: String,
      default: 'id'
    },
    props: {            // 配置项
      type: Object
    },
    showCheckbox: {     // 是否显示checkbox
      type: Boolean,
      default: false
    },
    search: {           // 模糊搜索关键词
      type: String,
      default: ''
    },
    defaultExpandAll: { // 默认展开全部节点
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      deepData: '',
      isTree: true
    }
  },
  watch: {
    search (val) {
      this.deepData = this._getLdqTree(this.deepData)
    }
  },
  created () {
    const deepData = deepCopy(this.data)
    this.deepData = this._getLdqTree(deepData)
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item.id} data={item}></search-node>) }
    </div>
  },
  methods: {
    _getLdqTree (tree) {
      tree = deepCopy(tree)
      tree.forEach(_ => {
        const keys = getDictionary(_.name, this.search)
        this.$set(_, 'keys', keys)
        this.$set(_, 'sort', computSortNum(keys))
        if (_.children && _.children.length) {
          _.children = this._getLdqTree(_.children)
          _.sort += _.children.reduce((max, _) => max > _.sort ? max : _.sort, 0)
        }
      })
      return getSortData(tree)
    },
    getCheckedKeys () { // 获取所有选中项的id值
      const _deep = data => {
        const ids = []
        data.forEach(item => {
          if (item?.children?.length) {
            ids.push(..._deep(item.children))
          } else {
            item.checked && ids.push(item[this.nodeKey])
          }
        })
        return ids
      }
      return _deep(this.deepData)
    },
    setCheckedKeys (keys) { // 覆盖选中项的值
      const _deep = data => {
        return data.forEach(item => {
          if (item?.children?.length) return !!_deep(item.children)
          let index = keys.indexOf(item[this.nodeKey])
          if (index === -1) return this.$set(item, 'checked', false)
          this.$set(item, 'checked', true)
          keys.splice(index, 1)
        })
      }
      _deep(this.deepData)
    },
    updateCheckedKeys (key, checked) { // 更新指定key的节点的checked
      const _deep = data => {
        return data.some(item => {
          if (item?.children?.length) return !!_deep(item.children)
          let index = keys.indexOf(item[this.nodeKey])
          if (index === -1) return false
          this.$set(item, 'checked', checked)
          keys.splice(index, 1)
          if (!keys.length) return true
          else return false
        })
      }
      return _deep(this.deepData)
    }
  }
}
</script>

<style scoped>

</style>
