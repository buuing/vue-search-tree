<script>
export default {
  name: 'zCheckbox',
  props: {
    value: Boolean,
    indeterminate: Boolean,
    disabled: Boolean
  },
  data() {
    return {
      isChecked: this.value
    }
  },
  watch: {
    value (val) {
      this.isChecked = val
    }
  },
  methods: {
    renderIcon () {
      if (this.indeterminate) return <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="#2080f0" stroke-width="2"/>
        <rect x="1.5" y="5" width="9" height="2" stroke="#2080f0" fill="#fff" stroke-width="0"/>
      </svg>
      return this.isChecked ? <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="#2080f0" stroke-width="2"/>
        <line x1="1.5" x2="5.5" y1="5.5" y2="10.5" stroke="#fff" fill="transparent" stroke-width="1.5"/>
        <line x1="10.5" x2="5" y1="2" y2="10" stroke="#fff" fill="transparent" stroke-width="1.5"/>
      </svg> : <svg width="12" height="12">
        <rect x="0" y="0" width="12" height="12" stroke="#2080f0" fill="transparent" stroke-width="2"/>
      </svg>
    }
  },
  render () {
    const { data, root } = this.$parent
    const { nodeKey } = root
    return <div style={{
      filter: `grayscale(${this.disabled ? 100 : 0}%)`,
      opacity: this.disabled ? 0.7 : 1
    }} onClick={e => {
      this.$emit('input', this.isChecked)
      this.$emit('change', e)
    }}>{ this.renderIcon() }</div>
  }
}
</script>

<style scoped>
div {
  display: block;
  width: 12px;
  height: 12px;
  cursor: pointer;
}
svg {
  vertical-align: super;
}
</style>
