


import { reactive } from 'vue'

// 完整配件数据映射（名称 -> 默认数量）- 使用 reactive 使其响应式
export const allAccessories = reactive<{ name: string; value: string }[]>([
  { name: '上包转角', value: '' },
  { name: '下包转角', value: '' },
  { name: ' ', value: '' },
])