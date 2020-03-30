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
    checkbox: {
      type: Boolean,
      default: false
    }
  },
  components: { searchNode },
  data () {
    return {
      deepData: JSON.parse(JSON.stringify(this.data)),
      isTree: true
    }
  },
  methods: {
  },
  render () {
    return <div class="ldq-tree">
      {
        this.deepData.map(item => <search-node
          key={item.id}
          data={item}
          checkbox={this.checkbox}
          onClickItem={e => console.log(e)}
        ></search-node>)
      }
    </div>
  }
}
</script>

<style scoped>

</style>
