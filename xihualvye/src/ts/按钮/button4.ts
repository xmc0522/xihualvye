// 主表格中各行的默认shuliang值
const defaultShuliang: Record<string, string> = {
  上包边: '2',
  下包边: '2',
  立柱: '4',
  前后横梁: '4',
  侧横梁: '4',
  中柱: '',
  加固: '',
  拉筋: '',
  横拉: '1',
  门料: '',
  侧板: '4',
}

// 底部门板默认shuliang
const defaultDoorPanelShuliang: Record<string, string> = {
  门板: '',
  侧门板: '2',
  背板: '',
}

// 固定备注的名称列表（这些行的beizhu不清空）
const fixedBeizhuNames = [
  '上包边',
  '下包边',
  '前后横梁',
  '侧横梁',
  '中柱',
  '加固',
  '拉筋',
  '横拉',
  '门料',
  '侧板',
]

/**
 * 通用清空表格函数
 * @param info - 页面基本信息的响应式对象
 * @param tableData - 主表格数据数组
 * @param doorPanelRows - 底部门板数据（ref对象的.value）
 * @param allAccessories - 配件数据数组
 */
export function clearTable(
  info: {
    customer: string
    date: string
    surface: string
    quantity: string
    orderNo: string
    length: string
    width: string
    height: string
    doorCount: string
    zhongCount: string
    remark: string
  },
  tableData: Array<{
    mingcheng: string
    guige: string
    shuliang: string
    beizhu: string
    [key: string]: any
  }>,
  doorPanelRows: Array<{
    name: string
    shuju1: string
    shuju2: string
    shuliang: string
    beizhu: string
  }>,
  allAccessories: Array<{ value: string; [key: string]: any }>,
) {
  // 1. 清空基本信息
  info.customer = ''
  info.date = ''
  info.surface = ''
  info.quantity = ''
  info.orderNo = ''
  info.length = ''
  info.width = ''
  info.height = ''
  info.doorCount = ''
  info.zhongCount = ''
  info.remark = ''

  // 2. 清空主表格数据（guige清空，shuliang还原默认值，可编辑的beizhu清空）
  for (const row of tableData) {
    row.guige = ''
    row.shuliang = defaultShuliang[row.mingcheng] ?? ''
    if (!fixedBeizhuNames.includes(row.mingcheng)) {
      row.beizhu = ''
    }
  }

  // 3. 清空底部门板数据
  for (const row of doorPanelRows) {
    row.shuju1 = ''
    row.shuju2 = ''
    row.shuliang = defaultDoorPanelShuliang[row.name] ?? ''
    row.beizhu = ''
  }

  // 4. 清空配件数据
  for (const item of allAccessories) {
    item.value = ''
  }
}
