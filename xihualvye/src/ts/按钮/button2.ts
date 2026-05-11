import { ElMessage } from 'element-plus'
import { createOrder, updateOrder, getOrderDetail } from '../api'

/**
 * 生成本地存储的 key
 * @param pageKey - 页面唯一标识（如 '天枢款-单门-加背板'）
 */
const getStorageKey = (pageKey: string) => {
  return `table_save_${pageKey}`
}

// 当前正在编辑的订单ID（null 表示新建）
let currentOrderId: number | null = null

/** 获取当前订单ID */
export function getCurrentOrderId(): number | null {
  return currentOrderId
}

/** 设置当前订单ID（用于从订单管理页面加载时） */
export function setCurrentOrderId(id: number | null) {
  currentOrderId = id
}

/**
 * 通用保存表格数据函数 - 同时保存到后端数据库和 localStorage
 * @param pageKey - 页面唯一标识，用作存储key
 * @param info - 基本信息
 * @param tableData - 主表格原始数据数组
 * @param doorPanelRows - 底部门板数据（ref 的 .value）
 * @param allAccessories - 配件数据数组
 */
export async function saveTableData(
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
    beibanCount?: string
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
  allAccessories: Array<{ name: string; value: string }>,
) {
  // ===== 保存前必填校验 =====
  const missing: string[] = []
  if (!info.customer?.trim()) missing.push('客户')
  if (!info.orderNo?.trim()) missing.push('客户单号')
  if (!info.quantity?.trim()) missing.push('数量')
  if (missing.length > 0) {
    ElMessage.warning(`请先填写：${missing.join('、')}`)
    return
  }

  // 构建保存数据（记录同名行的出现顺序索引，用于区分如两个"门料"行）
  const mingchengCountMap: Record<string, number> = {}
  const tableRows = tableData.map((row) => {
    const key = row.mingcheng
    if (mingchengCountMap[key] === undefined) mingchengCountMap[key] = 0
    const idx = mingchengCountMap[key]
    mingchengCountMap[key]++
    return {
      mingcheng: row.mingcheng,
      _mingchengIndex: idx,
      guige: row.guige,
      shuliang: row.shuliang,
      beizhu: row.beizhu,
    }
  })

  const panels = doorPanelRows.map((row) => ({
    name: row.name,
    shuju1: row.shuju1,
    shuju2: row.shuju2,
    shuliang: row.shuliang,
    beizhu: row.beizhu,
  }))

  const accs = allAccessories.map((item) => ({
    name: item.name,
    value: item.value,
  }))

  // 1. 保存到 localStorage 作为备份
  try {
    const localData = {
      info: { ...info },
      tableRows,
      doorPanels: panels,
      accessories: accs,
      savedAt: new Date().toLocaleString(),
    }
    const key = getStorageKey(pageKey)
    localStorage.setItem(key, JSON.stringify(localData))
  } catch (e) {
    console.warn('localStorage 保存失败:', e)
  }

  // 2. 保存到后端数据库
  try {
    const payload = {
      customer: info.customer,
      orderNo: info.orderNo,
      date: info.date,
      surface: info.surface,
      quantity: info.quantity,
      length: info.length,
      width: info.width,
      height: info.height,
      doorCount: info.doorCount,
      zhongCount: info.zhongCount,
      remark: info.remark,
      pageType: pageKey,
      tableData: tableRows,
      doorPanels: panels,
      accessories: accs,
    }

    if (currentOrderId) {
      // 更新已有订单
      await updateOrder(currentOrderId, payload)
      ElMessage.success('订单已更新保存')
    } else {
      // 新建订单
      const res = await createOrder(payload)
      currentOrderId = res.data.id
      ElMessage.success('订单已保存到数据库')
    }
  } catch (e: any) {
    console.error('后端保存失败:', e)
    ElMessage.warning('已保存到本地，但后端保存失败：' + (e.message || '网络错误'))
  }
}

/**
 * 从后端加载指定订单数据
 */
export async function loadOrderFromServer(
  orderId: number,
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
    beibanCount?: string
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
  allAccessories: Array<{ name: string; value: string }>,
): Promise<boolean> {
  try {
    const res = await getOrderDetail(orderId)
    const data = res.data

    // 恢复基本信息
    info.customer = data.customer || ''
    info.date = data.date || ''
    info.surface = data.surface || ''
    info.quantity = data.quantity || ''
    info.orderNo = data.order_no || ''
    info.length = data.length || ''
    info.width = data.width || ''
    info.height = data.height || ''
    info.doorCount = data.door_count || ''
    if ('beibanCount' in info)
      info.beibanCount = (data as { beiban_count?: string }).beiban_count || ''
    info.zhongCount = data.zhong_count || ''
    info.remark = data.remark || ''

    // 恢复主表格（按 mingcheng + 出现顺序索引匹配，避免同名行互相覆盖）
    if (data.table_data) {
      const mingchengCountMap: Record<string, number> = {}
      for (const row of tableData) {
        const key = row.mingcheng
        if (mingchengCountMap[key] === undefined) mingchengCountMap[key] = 0
        const idx = mingchengCountMap[key]
        mingchengCountMap[key]++
        const savedRow = data.table_data.find(
          (r: { mingcheng: string; _mingchengIndex?: number }) =>
            r.mingcheng === row.mingcheng && (r._mingchengIndex ?? 0) === idx,
        )
        if (savedRow) {
          row.guige = savedRow.guige ?? row.guige
          row.shuliang = savedRow.shuliang ?? row.shuliang
          row.beizhu = savedRow.beizhu ?? row.beizhu
        }
      }
    }

    // 恢复底部门板
    if (data.door_panels) {
      for (const row of doorPanelRows) {
        const savedRow = data.door_panels.find((r: { name: string }) => r.name === row.name)
        if (savedRow) {
          row.shuju1 = savedRow.shuju1 ?? ''
          row.shuju2 = savedRow.shuju2 ?? ''
          row.shuliang = savedRow.shuliang ?? ''
          row.beizhu = savedRow.beizhu ?? ''
        }
      }
    }

    // 恢复配件
    if (data.accessories) {
      for (const item of allAccessories) {
        const savedItem = data.accessories.find((a: { name: string }) => a.name === item.name)
        if (savedItem) {
          item.value = savedItem.value ?? ''
        }
      }
    }

    currentOrderId = orderId
    return true
  } catch (e) {
    console.error('从后端加载订单失败:', e)
    return false
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
    beibanCount?: string
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
  allAccessories: Array<{ name: string; value: string }>,
): boolean {
  try {
    const key = getStorageKey(pageKey)
    const saved = localStorage.getItem(key)
    if (!saved) return false

    const data = JSON.parse(saved)

    // 恢复基本信息
    if (data.info) {
      info.customer = data.info.customer || ''
      info.date = data.info.date || info.date  // 空值时保留初始值（今天）
      info.surface = data.info.surface || ''
      info.quantity = data.info.quantity || ''
      info.orderNo = data.info.orderNo || ''
      info.length = data.info.length || ''
      info.width = data.info.width || ''
      info.height = data.info.height || ''
      info.doorCount = data.info.doorCount || ''
      if ('beibanCount' in info) info.beibanCount = data.info.beibanCount || ''
      info.zhongCount = data.info.zhongCount || ''
      info.remark = data.info.remark || ''
    }

    // 恢复主表格中可编辑的字段（按 mingcheng + 出现顺序索引匹配，避免同名行互相覆盖）
    if (data.tableRows) {
      const mingchengCountMap: Record<string, number> = {}
      for (const row of tableData) {
        const key = row.mingcheng
        if (mingchengCountMap[key] === undefined) mingchengCountMap[key] = 0
        const idx = mingchengCountMap[key]
        mingchengCountMap[key]++
        const savedRow = data.tableRows.find(
          (r: { mingcheng: string; _mingchengIndex?: number }) =>
            r.mingcheng === row.mingcheng && (r._mingchengIndex ?? 0) === idx,
        )
        if (savedRow) {
          row.guige = savedRow.guige ?? row.guige
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
