// 计算匹配优先值
export const computSortNum = keys => {
  keys = JSON.parse(JSON.stringify(keys))
  let lev = 0, curr = keys.shift()
  return keys.length < 1 ? +!!(curr + 1) : keys.reduce((s, next, i) => {
    if (next - curr === 1) lev += 1
    else (s += (10 ** lev)) && (lev = 0)
    if (i === keys.length - 1) s += (10 ** lev)
    curr = next
    return s
  }, 0)
}
// 根据优先度排序
export const getSortData = arr => {
  const usable = [], disable = []
  arr.forEach(_ => _.sort === 0 ? disable.push(_) : usable.push(_))
  for (let i = 0; i < usable.length - 1; i++) {
    let maxIndex = i
    for (let j = i + 1; j < usable.length; j++) {
      if (usable[maxIndex].sort < usable[j].sort) {
        maxIndex = j
      }
    }
    [usable[i], usable[maxIndex]] = [usable[maxIndex], usable[i]]
  }
  return [...usable, ...disable]
}
// 反推字典表
export const getDictionary = (name, word) => {
  word = word.replace(/\s*/g, '')
  let res = []
  const _deep = word => {
    let keys = [], len = word.length
    for (let i = len; i > 0; i--) {
      for (let j = 0; j < len + 1 - i; j++) {
        keys.push(word.substr(j, i))
      }
    }
    let start = 0, end = 0, index = 0, step = 0
    if (!keys.some(_ => {
      index = name.indexOf(_)
      if (index === -1) return false
      if (res.length && res.indexOf(index) > -1) return false
      start = word.indexOf(_)
      end = start + _.length
      step = index + _.length
      return true
    })) return false
    while (step > index) res.push(index++)
    if (start - 0) _deep(word.slice(0, start))
    if (end - len) _deep(word.slice(end, len))
  }
  _deep(word)
  return res
}
