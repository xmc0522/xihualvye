import { reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { tableData } from './天枢款主表格数据'
import { allAccessories } from './天枢款配件数据'
import { doorPanelRows } from './天枢款底部门板数据'

// 本地存储 key 生成函数
const getStorageKey = (customer: string, orderNo: string) => {
  return `tianshu_${customer}_${orderNo}`
}

// 批量导入JPG文件夹下的所有图片
const imageModules = import.meta.glob('../../JPG/*.jpg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// 根据型号获取对应图片路径
const getImage = (xinghao: string) => {
  // 匹配键名中包含该型号的图片
  const key = Object.keys(imageModules).find((k) => k.includes(xinghao))
  return key ? imageModules[key] : ''
}

export function useChangyongBiaoge() {
  const route = useRoute()

  // 从路由参数中获取不生成的名称列表
  const excludeNames: string[] = (() => {
    try {
      const raw = route.query.excludeNames as string
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  // 从路由参数中获取需要生成的配件列表
  const includeAccessories: string[] = (() => {
    try {
      const raw = route.query.includeAccessories as string
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  // 基本信息（从路由参数中动态获取）
  const info = reactive({
    customer: (route.query.customer as string) || '',
    date: (route.query.date as string) || '',
    surface: (route.query.surface as string) || '',
    quantity: (route.query.quantity as string) || '',
    orderNo: (route.query.orderNo as string) || '',
    length: (route.query.length as string) || '',
    width: (route.query.width as string) || '',
    height: (route.query.height as string) || '',
    remark: '',
  })

  // 从本地存储加载数据
  const loadFromLocalStorage = () => {
    const key = getStorageKey(info.customer, info.orderNo)
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        // 恢复底部门板数据
        if (data.doorPanels) {
          doorPanelRows.value.forEach((row) => {
            const savedRow = data.doorPanels.find((r: { name: string }) => r.name === row.name)
            if (savedRow) {
              row.shuliang = savedRow.shuliang
              row.beizhu = savedRow.beizhu
            }
          })
        }
        // 恢复备注
        if (data.remark) {
          info.remark = data.remark
        }
      } catch (e) {
        console.error('加载本地数据失败:', e)
      }
    }
  }

  // 保存到本地存储
  const saveToLocalStorage = () => {
    const key = getStorageKey(info.customer, info.orderNo)
    if (!info.customer || !info.orderNo) return
    const data = {
      doorPanels: doorPanelRows.value.map((row) => ({
        name: row.name,
        shuliang: row.shuliang,
        beizhu: row.beizhu,
      })),
      remark: info.remark,
    }
    localStorage.setItem(key, JSON.stringify(data))
  }

  // 页面加载时从本地存储恢复数据
  onMounted(() => {
    loadFromLocalStorage()
  })

  // 根据不生成的名称过滤表格数据，并重新计算合并单元格
  const filteredTableData = computed(() => {
    // 过滤掉被排除的名称对应的行
    const filtered = tableData.filter((row) => !excludeNames.includes(row.mingcheng))

    // 重新计算合并标记
    const result = filtered.map((row, index) => ({ ...row }))

    // 先统计上包边和下包边的总行数
    let shangXiaBaoBianStart = -1 // 上包边/下包边整体的起始索引
    let shangXiaBaoBianCount = 0 // 上包边+下包边的总行数
    for (let i = 0; i < result.length; i++) {
      const row = result[i]
      if (row && (row.mingcheng === '上包边' || row.mingcheng === '下包边')) {
        if (shangXiaBaoBianStart === -1) {
          shangXiaBaoBianStart = i
        }
        shangXiaBaoBianCount++
      }
    }
    // 判断是否上包边和下包边同时存在（总行数 >= 4）
    const shangXiaBaoBianTogether = shangXiaBaoBianCount >= 4

    // 找到立柱和门料的索引，用于备注列合并
    let liZhuIndex = -1
    let menLiaoStartIndex = -1
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '立柱') {
        liZhuIndex = i
      }
      if (result[i] && result[i]!.mingcheng === '门料') {
        menLiaoStartIndex = i
        break
      }
    }

    // 立柱到门料之间的备注列合并（立柱行不合并，从下一行开始）
    if (liZhuIndex >= 0 && menLiaoStartIndex > liZhuIndex + 1) {
      const beizhuMergeCount = menLiaoStartIndex - liZhuIndex - 1
      const startRow = result[liZhuIndex + 1]
      if (startRow) {
        startRow._mergeBeizhu = beizhuMergeCount
      }
      for (let j = liZhuIndex + 2; j < menLiaoStartIndex; j++) {
        if (result[j]) {
          result[j]!._mergeBeizhu = 0
        }
      }
    }

    for (let i = 0; i < result.length; i++) {
      const currentRow = result[i]
      if (!currentRow) continue
      // 计算当前行开始，连续相同名称的行数
      let count = 1
      while (i + count < result.length) {
        const nextRow = result[i + count]
        if (
          !nextRow ||
          currentRow.mingcheng !== nextRow.mingcheng ||
          currentRow.xinghao !== nextRow.xinghao
        ) {
          break
        }
        count++
      }
      // 第一行设置 rowspan = count，后续行设置为 0（被合并）
      currentRow._mergeXinghao = count
      currentRow._mergeTupian = count
      currentRow._mergeMingcheng = count
      currentRow._mergeShuliang = count

      // 上包边、下包边、侧板的备注列合并逻辑
      if (
        currentRow.mingcheng === '上包边' ||
        currentRow.mingcheng === '下包边' ||
        currentRow.mingcheng === '侧板'
      ) {
        if (
          shangXiaBaoBianTogether &&
          (currentRow.mingcheng === '上包边' || currentRow.mingcheng === '下包边')
        ) {
          // 上包边+下包边同时存在时，备注列合并4行
          if (i === shangXiaBaoBianStart) {
            // 只有第一行设置合并，其他行设为0
            currentRow._mergeBeizhu = shangXiaBaoBianCount
            for (let j = 1; j < shangXiaBaoBianCount; j++) {
              const targetRow = result[i + j]
              if (targetRow) {
                targetRow._mergeBeizhu = 0
              }
            }
          } else {
            currentRow._mergeBeizhu = 0
          }
        } else {
          // 只有一个时，按原来的2行合并
          currentRow._mergeBeizhu = count
          for (let j = 1; j < count; j++) {
            const mergedRow = result[i + j]
            if (mergedRow) {
              mergedRow._mergeBeizhu = 0
            }
          }
        }
      }

      for (let j = 1; j < count; j++) {
        const mergedRow = result[i + j]
        if (mergedRow) {
          mergedRow._mergeXinghao = 0
          mergedRow._mergeTupian = 0
          mergedRow._mergeMingcheng = 0
          mergedRow._mergeShuliang = 0
        }
      }
      i += count - 1 // 跳过已处理的行
    }
    return result
  })

  // 合并单元格方法
  const mergeMethod = ({ row, column, rowIndex, columnIndex }: any) => {
    // 对 型号(0)、图片(1)、名称(2) 列进行合并
    if (columnIndex <= 2) {
      const mergeKey =
        columnIndex === 0 ? '_mergeXinghao' : columnIndex === 1 ? '_mergeTupian' : '_mergeMingcheng'
      if (row[mergeKey] > 0) {
        return { rowspan: row[mergeKey], colspan: 1 }
      } else if (row[mergeKey] === 0) {
        return { rowspan: 0, colspan: 0 }
      }
    }

    // 对备注列(5)进行合并（上包边、下包边、侧板）
    if (columnIndex === 5) {
      if (row._mergeBeizhu > 0) {
        return { rowspan: row._mergeBeizhu, colspan: 1 }
      } else if (row._mergeBeizhu === 0) {
        return { rowspan: 0, colspan: 0 }
      }
    }

    return { rowspan: 1, colspan: 1 }
  }

  // 根据value5选中的配件动态生成配件表行（每行3个配件，共6列）
  const accessoryRows = computed(() => {
    // 过滤出用户选中的配件
    const selected = allAccessories.filter((item) => includeAccessories.includes(item.name))
    // 每行放3个配件
    const rows: {
      name1: string
      value1: string
      name2: string
      value2: string
      name3: string
      value3: string
    }[] = []
    for (let i = 0; i < selected.length; i += 3) {
      rows.push({
        name1: selected[i]?.name || '',
        value1: selected[i]?.value || '',
        name2: selected[i + 1]?.name || '',
        value2: selected[i + 1]?.value || '',
        name3: selected[i + 2]?.name || '',
        value3: selected[i + 2]?.value || '',
      })
    }
    return rows
  })

  return { info, filteredTableData, mergeMethod, accessoryRows, doorPanelRows, getImage, saveToLocalStorage }
}
