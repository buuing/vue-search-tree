<script>
export default {
  name: 'search-node',
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {}
  },
  render () {
    const { data } = this
    return <ul class="tree-ul">
      <li class="tree-li">
        <input type="checkbox" />
        <span>{data.name}</span>
      </li>
      {
        data.children && data.children.length ? data.children.map(item => {
          return <search-node key={item.id} data={item}></search-node>
        }) : null
      }
    </ul>
  }
}
</script>

<style scoped>
  .tree-ul, .tree-li {
    margin: 0;
    list-style: none;
    padding-left: 10px;
  }
  .tree-li {
    display: flex;
    align-items: center;
  }
  .tree-expand {
    cursor: pointer;
  }
</style>
