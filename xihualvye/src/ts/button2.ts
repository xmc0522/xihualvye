import { ElMessage } from 'element-plus'
import type { Ref } from 'vue'

/**
 * 生成本地存储的 key
 * @param pageKey - 页面唯一标识（如 '天枢款-单门-加背板'）
 */
const getStorageKey = (pageKey: string) => {
  return `table_save_${pageKey}`
}

/**
 * 通用保存表格数据函数 - 将页面所有表格数据保存到 localStorage
 * @param pageKey - 页面唯一标识，用作存储key
 * @param info - 基本信息
 * @param tableData - 主表格原始数据数组
 * @param doorPanelRows - 底部门板数据（ref 的 .value）
 * @param allAccessories - 配件数据数组
 */
export function saveTableData(
  pageKey: string,
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
  tableData: Array<{ mingcheng: string; guige: string; shuliang: string; beizhu: string; [key: string]: any }>,
  doorPanelRows: Array<{ name: string; shuju1: string; shuju2: string; shuliang: string; beizhu: string }>,
  allAccessories: Array<{ name: string; value: string }>
) {
  try {
    const data = {
      // 保存基本信息
      info: {
        customer: info.customer,
        date: info.date,
        surface: info.surface,
        quantity: info.quantity,
        orderNo: info.orderNo,
        length: info.length,
        width: info.width,
        height: info.height,
        doorCount: info.doorCount,
        zhongCount: info.zhongCount,
        remark: info.remark,
      },
      // 保存主表格中可编辑的字段（shuliang、beizhu）
      tableRows: tableData.map((row) => ({
        mingcheng: row.mingcheng,
        shuliang: row.shuliang,
        beizhu: row.beizhu,
      })),
      // 保存底部门板数据
      doorPanels: doorPanelRows.map((row) => ({
        name: row.name,
        shuju1: row.shuju1,
        shuju2: row.shuju2,
        shuliang: row.shuliang,
        beizhu: row.beizhu,
      })),
      // 保存配件数据
      accessories: allAccessories.map((item) => ({
        name: item.name,
        value: item.value,
      })),
      // 保存时间戳
      savedAt: new Date().toLocaleString(),
    }

    const key = getStorageKey(pageKey)
    localStorage.setItem(key, JSON.stringify(data))
    ElMessage.success('表格数据已保存到本地')
  } catch (e) {
    console.error('保存表格数据失败:', e)
    ElMessage.error('保存失败，请重试')
  }
}

/**
 * 通用加载表格数据函数 - 从 localStorage 恢复页面所有表格数据
 * @param pageKey - 页面唯一标识
 * @param info - 基本信息
 * @param tableData - 主表格原始数据数组
 * @param doorPanelRows - 底部门板数据（ref 的 .value）
 * @param allAccessories - 配件数据数组
 * @returns 是否成功加载了数据
 */
export function loadTableData(
  pageKey: string,
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
  tableData: Array<{ mingcheng: string; guige: string; shuliang: string; beizhu: string; [key: string]: any }>,
  doorPanelRows: Array<{ name: string; shuju1: string; shuju2: string; shuliang: string; beizhu: string }>,
  allAccessories: Array<{ name: string; value: string }>
): boolean {
  try {
    const key = getStorageKey(pageKey)
    const saved = localStorage.getItem(key)
    if (!saved) return false

    const data = JSON.parse(saved)

    // 恢复基本信息
    if (data.info) {
      info.customer = data.info.customer || ''
      info.date = data.info.date || ''
      info.surface = data.info.surface || ''
      info.quantity = data.info.quantity || ''
      info.orderNo = data.info.orderNo || ''
      info.length = data.info.length || ''
      info.width = data.info.width || ''
      info.height = data.info.height || ''
      info.doorCount = data.info.doorCount || ''
      info.zhongCount = data.info.zhongCount || ''
      info.remark = data.info.remark || ''
    }

    // 恢复主表格中可编辑的字段
    if (data.tableRows) {
      for (const row of tableData) {
        const savedRow = data.tableRows.find((r: { mingcheng: string }) => r.mingcheng === row.mingcheng)
        if (savedRow) {
          row.shuliang = savedRow.shuliang ?? row.shuliang
          row.beizhu = savedRow.beizhu ?? row.beizhu
        }
      }
    }

    // 恢复底部门板数据
    if (data.doorPanels) {
      for (const row of doorPanelRows) {
        const savedRow = data.doorPanels.find((r: { name: string }) => r.name === row.name)
        if (savedRow) {
          row.shuju1 = savedRow.shuju1 ?? ''
          row.shuju2 = savedRow.shuju2 ?? ''
          row.shuliang = savedRow.shuliang ?? ''
          row.beizhu = savedRow.beizhu ?? ''
        }
      }
    }

    // 恢复配件数据
    if (data.accessories) {
      for (const item of allAccessories) {
        const savedItem = data.accessories.find((a: { name: string }) => a.name === item.name)
        if (savedItem) {
          item.value = savedItem.value ?? ''
        }
      }
    }

    return true
  } catch (e) {
    console.error('加载本地表格数据失败:', e)
    return false
  }
}
