<script>
import { deepCopy } from './utils.js'
import zCheckbox from './z-checkbox.vue'
export default {
  name: 'search-node',
  components: { zCheckbox },
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      root: null,
      children: [],
    }
  },
  created () {
    const { data, $parent } = this
    this.root = $parent.isTree ? $parent : $parent.root
    this.$set(data, '$pid', $parent.isTree ? null : $parent.data[this.root.nodeKey])
  },
  render () {
    const { data, root } = this
    const { name, children, disabled } = root.defaultProps
    let hideMisses = (!root.hideMisses || data.visible) && (root.filterNode ? root.filterNode(data) : true)
    return hideMisses ? <ul class="tree-ul">
      <li class="tree-li">
        <i class="tree-triangle point" style={{
          transform: `rotate(${data.expand ? '0' : '-90'}deg)`,
          visibility: data[children].length ? 'visible' : 'hidden'
        }} onClick={e => this.handlerExpand(e)}></i>
        {
          root.showCheckbox && <zCheckbox
            theme-color={root.themeColor}
            value={data.checked}
            disabled={data[disabled]}
            indeterminate={data.indeterminate}
            onClick={e => this.handlerChecked(e)}
          ></zCheckbox>
        }
        <div class="tree-content point" onClick={e => {
          root.expandOnClickNode && this.handlerExpand(e)
          root.checkOnClickNode && this.handlerChecked(e)
          root.$emit('node-click', e, deepCopy(data))
        }}>
          {
            root.$scopedSlots.default ? root.$scopedSlots.default(data) : <p class="tree-text">
              {
                data.$keys.length ? data[name].split('').map((curr, i) => {
                  return <span class={ data.$keys.includes(i) ? 'red' : 'gary' }>{curr}</span>
                }) : <span class="gary">{data[name]}</span>
              }
            </p>
          }
        </div>
      </li>
      {
        !!data[children].length && data.expand && <div>
          {
            data[children].map(item => <search-node
              key={item[root.nodeKey]}
              data={item}
              onCheck-change={this._upwardUpdateChecked}
            ></search-node>)
          }
        </div>
      }
    </ul> : null
  },
  methods: {
    _upwardUpdateChecked (checked) {
      const { data, root } = this
      const { children } = root.defaultProps
      let oneNodeIsIndeterminate = false, len = data[children].length
      // 获取所有选中节点的数量
      const checkedNum = data[children].reduce((num, item) => {
        if (item.indeterminate) oneNodeIsIndeterminate = true
        return num += +item.checked
      }, 0)
      // 所有节点都被选中时checked=true, 反之false
      data.checked = checkedNum === len
      // 如果全部节点都选中了, 那么indeterminate必然等于false, 否则就看子节点是否有半选节点, 再看子节点是否有0个未选中
      data.indeterminate = checkedNum === len ? false : (oneNodeIsIndeterminate || !!checkedNum)
      this.$emit('check-change', data.checked)
    },
    handlerChecked (e) {
      const { data, root } = this
      const { children, disabled } = root.defaultProps
      if (data[disabled]) return false
      let checked = !data.checked
      // 过滤所有disabled=false的叶子节点, 如果有没选中的就重写checked
      data[children].length && checked && (
        checked = !!root._levelOrder(data[children], item => !item[disabled] && !item.checked)
      )
      // 必须先向下改变状态
      root._downwardUpdateChecked(data, checked)
      // 再向上逐级传递状态
      this.$emit('check-change', checked)
      root.$emit('node-checked', e, deepCopy(data))
    },
    handlerExpand (e) {
      const { data, root } = this
      if (!data.children.length) return false
      data.expand = !data.expand
      root.$emit('node-expand', e, deepCopy(data))
    }
  }
}
</script>

<style scoped>
  .tree-ul {
    margin: 0;
    padding: 0 0 0 17px;
  }
  .tree-li {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    align-items: center;
    transform: translate(0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tree-triangle {
    width: 0px;
    height: 0px;
    border-top: #c0c4cc 6px solid;
    border-right: transparent 4px solid;
    border-left: transparent 4px solid;
  }
  .tree-content {
    width: 100%;
    margin: 0 0 0 3px;
  }
  .tree-content p {
    margin: 0;
  }
  .tree-text {
    margin: 0;
  }
  .point {
    cursor: pointer;
  }
  .red {
    color: red;
  }
  .gary {
    color: gray;
  }
</style>
