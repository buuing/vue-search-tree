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
    return <ul style={{ margin: 0, padding: '0 0 0 15px' }}>
      <li style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'flex',
        alignItems: 'center'
      }}>
        <svg t="1585220115926" class="tree-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2222" width="10" height="10" style={{
          transform: 'rotate(-90deg)'
        }}>
          <path d="M151.476947 199.553918l718.53082 0c39.763632 0 71.922053 31.909757 71.922053 71.675436 0 18.485003-7.095605 35.205826-18.486026 47.872311L568.114019 793.227056c-23.810289 31.400151-68.641333 37.993313-100.29731 14.183024-5.570879-4.052293-10.384511-8.873088-14.183024-14.190187L94.235245 314.041416c-23.547299-31.407314-17.217127-76.479859 14.436804-100.041484 12.922311-9.881045 27.864628-14.43885 42.804898-14.43885l0 0L151.476947 199.553918zM151.476947 199.553918" p-id="2223" fill="#c0c4cc"></path>
        </svg>
        <input type="checkbox" style="cursor: pointer; transform: translateY(1px)" />
        <span style="cursor: pointer">{data.name}</span>
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
