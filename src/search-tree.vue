<script>
import searchNode from './search-node.vue'
import { computSortNum, getSortData, getDictionary } from './utils.js'
export default {
  name: 'search-tree',
  components: { searchNode },
  props: {
    data: {             // 源数据
      type: Array,
      required: true
    },
    nodeKey: {
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
    const deepData = JSON.parse(JSON.stringify(this.data))
    this.deepData = this._getLdqTree(deepData)
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item.id} data={item}></search-node>) }
    </div>
  },
  methods: {
    _getLdqTree (tree) {
      tree = JSON.parse(JSON.stringify(tree))
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
    getCheckedKeys (data) { // 获取所有选中项的id值
      data = data || this.deepData
      const ids = []
      data.forEach(item => {
        if (item?.children?.length) {
          ids.push(...this.getCheckedKeys(item.children))
        } else {
          item.checked && ids.push(item[this.nodeKey])
        }
      })
      return ids
    }
  }
}
</script>

<style scoped>

</style>
