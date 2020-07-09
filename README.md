
## 安装

> `npm i vue-search-tree`

<br />

## Demo演示

> https://100px.net/vue-search-tree/

<br />

## 使用

### 方式1: 通过 script 标签引入 (适用于前后不分离项目)

> 在dist目录下找到一个css和一个js文件, 然后在页面上假如如下两行代码

其中`js`文件记得要放在引入vue的script后面

```html
<link rel="stylesheet" href="./dist/search-tree@2.2.3.css">
...
<script src="./dist/search-tree@2.2.3.min.js"></script>
```

<br />

### 方式2: 通过 import 方式引入

> 先找到`main.js`引入插件并`use`

```js
import SearchTree from 'vue-search-tree'

Vue.use(SearchTree)
```

> 使用示例请参照Demo演示

<br />

## 属性 (Attributes)

| 参数                   | 说明 | 类型 | 默认值
|  :-:                  | :-: | :-: | :-:
| data                  | 源数据 | Array | 必填项
| node-key              | 节点的唯一标识 | String | 'id'
| theme-color           | 主题色 | String | '#409eff'
| search                | 模糊搜索的关键词 | String | ''
| hide-misses           | 是否隐藏模糊搜索不匹配的节点 | Boolean | true
| expand-misses         | 是否展开模糊搜索不匹配的节点 | Boolean | false
| search-debounce       | 模糊搜索防抖 (毫秒) | Number | 500
| empty-text            | 内容为空时展示的文本 | String | ''
| show-checkbox         | 是否显示checkbox | Boolean | false
| default-expand-all    | 是否默认展开所有节点 | Boolean | false
| expand-on-click-node  | 点击节点时是否展开或折叠 | Boolean | true
| check-on-click-node   | 点击节点时是否选中节点 | Boolean | false
| default-expanded-keys | 默认展开节点的keys | Array | []
| default-checked-keys  | 默认选中节点的keys | Array | []
| filter-node           | 过滤显示的节点 (该方法得到的是引用节点) | Function | -
| props                 | 配置选项，请看下表 | Object | 

<br />

## props (配置项)

| 参数      | 说明 | 类型
|  :-:     | :-: | :-:
| name     | 节点名称 | String
| children | 节点的子集 | String
| disabled | 该节点是否禁用 | String

<br />

## 事件 (Event)

| 事件名        | 说明 | 参数
|  :-:         | :-: | :-:
| node-click   | 节点被点击时触发 | 参数1: 事件参数event, 参数2: 当前node节点
| node-checked | 节点的选中状态改变时触发 | 参数1: 事件参数event, 参数2: 当前node节点
| node-expand  | 节点展开或折叠时触发 | 参数1: 事件参数event, 参数2: 当前node节点

<br />

## 方法 (Methods)

| 方法名           | 说明 | 参数 | 参数类型 | 返回值
|  :-:            | :-: | :-: | :-: | :-:
| getNodeByKey    | 通过key获取对应节点 | 参数1: 唯一标识key | String / Number | 成功返回对应的节点, 失败返回null
| resetChecked    | 取消所有节点的选中状态 | - | - | -
| setCheckedByKeys| 通过keys批量设置节点的选中状态 | 参数1: 唯一标识keys, 参数2: 状态 | 参数1: Array, 参数2: Boolean | -
| getCheckedKeys  | 获取选中节点的keys | 参数1: 指定表示(默认为nodeKey) | String | 所有选中节点的唯一标识keys
| getCheckedNodes | 获取选中的节点nodes | - | - | 所有选中的节点nodes
| remove          | 通过key删除一个节点 | 参数1: 唯一标识key或当前节点 | String / Number | 成功返回true, 失败返回false
| append          | 通过key添加一个子节点 | 参数1: 唯一标识key或当前节点, 参数2: node节点 | String / Number | 成功返回true, 失败返回false
| insertBefore    | 通过key在前添加一个兄弟节点 | 参数1: 唯一标识key或当前节点, 参数2: node节点 | String / Number | 成功返回true, 失败返回false
| insertAfter     | 通过key在后添加一个兄弟节点 | 参数1: 唯一标识key或当前节点, 参数2: node节点 | String / Number | 成功返回true, 失败返回false
| getTotalOfNodes | 获取所有满足条件的节点数量 | - | Function | 所有满足条件的节点数量

- **`getTotalOfNodes` 使用示例:**

  - 获取所有名称包含'北京'的节点: `getTotalOfNodes(node => node.name.indexOf('北京') > -1)`
