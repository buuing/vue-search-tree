<script>
export default {
  name: 'zCheckbox',
  functional: true,
  render (h, ctx) {
    const { props } = ctx
    const renderIcon = function (props) {
      if (props.indeterminate) return <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="#2080f0" stroke-width="2"/>
        <rect x="1.5" y="5" width="9" height="2" stroke="#2080f0" fill="#fff" stroke-width="0"/>
      </svg>
      if (props.value) return <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="#2080f0" stroke-width="2"/>
        <line x1="1.5" x2="5.5" y1="5.5" y2="10.5" stroke="#fff" fill="transparent" stroke-width="1.5"/>
        <line x1="10.5" x2="5" y1="2" y2="10" stroke="#fff" fill="transparent" stroke-width="1.5"/>
      </svg>
      return <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="transparent" stroke-width="2"/>
      </svg>
    }
    return <div class="tree-checkbox" style={{
      filter: `grayscale(${props.disabled ? 100 : 0}%)`,
      opacity: props.disabled ? 0.7 : 1
    }} onClick={e => ctx.listeners.click(e)}>{renderIcon(props)}</div>
  }
}
</script>

<style scoped>
div {
  display: block;
  width: 12px;
  height: 12px;
  cursor: pointer;
  margin: 0 0 0 4px;
  cursor: pointer;
}
svg {
  vertical-align: super;
}
</style>
