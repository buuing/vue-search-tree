<script>
import searchNode from './search-node.vue'
import { getLdqTree } from './utils.js'
export default {
  name: 'search-tree',
  components: { searchNode },
  props: {
    data: {             // 源数据
      type: Array,
      required: true
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
      this.deepData = getLdqTree(this.deepData, val)
    }
  },
  created () {
    const deepData = JSON.parse(JSON.stringify(this.data))
    this.deepData = getLdqTree(deepData, this.search)
  },
  render () {
    return <div class="ldq-tree">
      { this.deepData.map(item => <search-node key={item.id} data={item}></search-node>) }
    </div>
  }
}
</script>

<style scoped>

</style>
