import SearchTree from './search-tree'

const install = (Vue, options) => {
  Vue.component('SearchTree', SearchTree)
}

if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue)
}

export default { install }
