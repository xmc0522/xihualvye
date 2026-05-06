import { reactive } from 'vue'

// 完整配件数据映射（名称 -> 默认数量）- 使用 reactive 使其响应式
export const allAccessories = reactive<{ name: string; value: string }[]>([
  { name: '上包转角', value: '' },
  { name: '下包转角', value: '' },
  { name: ' ', value: '' },
  // { name: '三卡锁', value: '' },
  // { name: '堵头(分左右)', value: '' },
  // { name: '角码', value: '' },
  // { name: '反弹器', value: '' },
  // { name: '大弯铰链', value: '' },
  // { name: '直臂铰链', value: '' },
  // { name: '铰链垫块', value: '' },
  // { name: '4*10螺丝', value: '' },
  // { name: '4*19螺丝', value: '' },
])
