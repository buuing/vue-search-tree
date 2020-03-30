<script>
import searchNode from './search-node.vue'
import { getLdqTree } from './utils.js'
export default {
  name: 'search-tree',
  props: {
    data: {
      type: Array,
      required: true
    },
    props: {
      type: Object
    },
    checkbox: {
      type: Boolean,
      default: false
    },
    search: {
      type: String,
      default: ''
    }
  },
  components: { searchNode },
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
      { this.deepData.map(item => <search-node
        key={item.id}
        data={item}
        checkbox={this.checkbox}
        onClickItem={e => console.log(e)}
      ></search-node>) }
    </div>
  }
}
</script>

<style scoped>

</style>
