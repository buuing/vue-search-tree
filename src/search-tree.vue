<script>
import searchNode from './search-node.vue'
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
    showCheckbox: {
      type: Boolean,
      default: false
    }
  },
  components: { searchNode },
  data () {
    return {}
  },
  render () {
    return <div class="ldq-tree">
      { this.data.map(item => <search-node key={item.id} data={item}></search-node>) }
    </div>
  }
}
</script>

<style>

</style>
