import { reactive, computed, watch, onMounted, type Ref, ref } from 'vue'
import { tableData } from './自由选择-单面门-通配款-主表格数据'
import { allAccessories } from './自由选择-单面门-通配款-配件数据'
import { doorPanelRows } from './自由选择-单面门-通配款-底部门板数据'

// 本地存储 key 生成函数
const getStorageKey = (customer: string, orderNo: string) => {
  return `tianshu_${customer}_${orderNo}`
}

// 批量导入JPG文件夹下的所有图片
const imageModules = import.meta.glob('../../../JPG/*.jpg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

// 根据型号获取对应图片路径
const getImage = (xinghao: string) => {
  // 匹配键名中包含该型号的图片
  const key = Object.keys(imageModules).find((k) => k.includes(xinghao))
  return key ? imageModules[key] : ''
}

export function useChangyongBiaoge(externalExcludeNames?: Ref<string[]>, externalExcludeDoorPanels?: Ref<string[]>) {
  // 使用外部传入的排除名称列表（响应式），若未传入则使用空数组
  const excludeNamesRef = externalExcludeNames || ref<string[]>([])
  // 使用外部传入的排除底部门板名称列表（响应式），若未传入则使用空数组
  const excludeDoorPanelsRef = externalExcludeDoorPanels || ref<string[]>([])

  // 记录被排除前每行的 guige 和 shuliang 值（用于取消排除时恢复）
  const savedTableValuesMap = new Map<number, { guige: string; shuliang: string }>()

  // 记录被排除前底部门板每行的 shuju1、shuju2、shuliang 值
  const savedDoorPanelValuesMap = new Map<string, { shuju1: string; shuju2: string; shuliang: string }>()

  // 监听"不生成的名称"下拉框变化：被排除的行 guige 和 shuliang 赋 '0'，取消排除时恢复排除前的值
  watch(excludeNamesRef, (newExcludeNames, oldExcludeNames) => {
    const oldNames = oldExcludeNames || []

    tableData.forEach((row, index) => {
      const isNowExcluded = newExcludeNames.includes(row.mingcheng)
      const wasExcluded = oldNames.includes(row.mingcheng)

      if (isNowExcluded && !wasExcluded) {
        // 新增排除：备份当前值，然后赋0
        savedTableValuesMap.set(index, { guige: row.guige, shuliang: row.shuliang })
        row.guige = '0'
        row.shuliang = '0'
      } else if (!isNowExcluded && wasExcluded) {
        // 取消排除：恢复备份的值
        const saved = savedTableValuesMap.get(index)
        if (saved !== undefined) {
          row.guige = saved.guige
          row.shuliang = saved.shuliang
          savedTableValuesMap.delete(index)
        }
      }
    })
  }, { deep: true })

  // 监听"不生成的配件"下拉框变化：被排除的底部门板行赋 '0'，取消排除时恢复排除前的值
  watch(excludeDoorPanelsRef, (newExcludeDoorPanels, oldExcludeDoorPanels) => {
    const oldNames = oldExcludeDoorPanels || []

    doorPanelRows.value.forEach((row) => {
      const isNowExcluded = newExcludeDoorPanels.includes(row.name)
      const wasExcluded = oldNames.includes(row.name)

      if (isNowExcluded && !wasExcluded) {
        // 新增排除：备份当前值，然后赋0
        savedDoorPanelValuesMap.set(row.name, { shuju1: row.shuju1, shuju2: row.shuju2, shuliang: row.shuliang })
        row.shuju1 = '0'
        row.shuju2 = '0'
        row.shuliang = '0'
      } else if (!isNowExcluded && wasExcluded) {
        // 取消排除：恢复备份的值
        const saved = savedDoorPanelValuesMap.get(row.name)
        if (saved !== undefined) {
          row.shuju1 = saved.shuju1
          row.shuju2 = saved.shuju2
          row.shuliang = saved.shuliang
          savedDoorPanelValuesMap.delete(row.name)
        }
      }
    })
  }, { deep: true })

  // 基本信息（页面手动输入）
  const info = reactive({
    customer: '',
    date: '',
    surface: '',
    quantity: '',
    orderNo: '',
    length: '',
    width: '',
    height: '',
    doorCount: '',
    zhongCount: '',
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
    // 数量倍率：所有 shuliang 都要乘以 quantity
    const qty = Number(info.quantity) || 1

    // 过滤掉被排除的名称对应的行
    const filtered = tableData.filter((row) => !excludeNamesRef.value.includes(row.mingcheng))

    // 重新计算合并标记
    const result = filtered.map((row, index) => ({ ...row }))

    // 计算上包边的规格值：第一个上包边 = length - 84，第二个上包边 = width - 84
    // 上包边shuliang = 固定值2 * quantity
    let shangBaoBianIndex = 0
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '上包边') {
        shangBaoBianIndex++
        if (shangBaoBianIndex === 1 && info.length) {
          // 第一个上包边：规格 = 长度 - 84
          result[i]!.guige = String(Number(info.length) - 84)
        } else if (shangBaoBianIndex === 2 && info.width) {
          // 第二个上包边：规格 = 宽度 - 84
          result[i]!.guige = String(Number(info.width) - 84)
        }
        result[i]!.shuliang = String(2 * qty)
      }
    }

    // 计算下包边的规格值：第一个下包边 = length - 84，第二个下包边 = width - 84
    // 下包边shuliang = 固定值2 * quantity
    let xiaBaoBianIndex = 0
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '下包边') {
        xiaBaoBianIndex++
        if (xiaBaoBianIndex === 1 && info.length) {
          // 第一个下包边：规格 = 长度 - 84
          result[i]!.guige = String(Number(info.length) - 84)
        } else if (xiaBaoBianIndex === 2 && info.width) {
          // 第二个下包边：规格 = 宽度 - 84
          result[i]!.guige = String(Number(info.width) - 84)
        }
        result[i]!.shuliang = String(2 * qty)
      }
    }

    // 计算立柱的规格值：立柱规格 = height - 3
    // 立柱shuliang = 固定值4 * quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '立柱') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 3)
        }
        result[i]!.shuliang = String(4 * qty)
      }
    }

    // 计算前后横梁的规格值：前后横梁规格 = length - 80
    // 前后横梁shuliang = 固定值4 * quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '前后横梁') {
        if (info.length) {
          result[i]!.guige = String(Number(info.length) - 80)
        }
        result[i]!.shuliang = String(4 * qty)
      }
    }

    // 计算侧横梁的规格值：侧横梁规格 = width - 140
    // 侧横梁shuliang = 固定值4 * quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '侧横梁') {
        if (info.width) {
          result[i]!.guige = String(Number(info.width) - 140)
        }
        result[i]!.shuliang = String(4 * qty)
      }
    }

    // 判断背板是否被排除（不生成底部门板下拉框中勾选了背板）
    const isBeiBanExcluded = excludeDoorPanelsRef.value.includes('背板')

    // 计算中 柱（H-1076）的规格值和数量：
    // guige = height - 90
    // shuliang = 背板被排除时 (doorCount - 1) * 2，否则 (doorCount - 1) * 2 / 2，再乘以 quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '中 柱') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        }
        if (info.doorCount) {
          if (isBeiBanExcluded) {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 * qty)
          } else {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 / 2 * qty)
          }
        } else {
          result[i]!.shuliang = ''
        }
      }
    }

    // 计算中柱（H-1005）的规格值和数量：
    // guige = height - 90
    // shuliang = 背板被排除时 (doorCount - 1) * 2，否则 (doorCount - 1) * 2 / 2，再乘以 quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '中柱') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        }
        if (info.doorCount) {
          if (isBeiBanExcluded) {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 * qty)
          } else {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 / 2 * qty)
          }
        } else {
          result[i]!.shuliang = ''
        }
      }
    }

    // 计算加固的规格值和数量（与中柱相同）：
    // guige = height - 90
    // shuliang = 背板被排除时 (doorCount - 1) * 2，否则 (doorCount - 1) * 2 / 2，再乘以 quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '加固') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        }
        if (info.doorCount) {
          if (isBeiBanExcluded) {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 * qty)
          } else {
            result[i]!.shuliang = String((Number(info.doorCount) - 1) * 2 / 2 * qty)
          }
        } else {
          result[i]!.shuliang = ''
        }
      }
    }
    // 计算拉筋的规格值：拉筋规格 = width - 102
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '拉筋') {
        if (info.width) {
          result[i]!.guige = String(Number(info.width) - 102)
        }
        // 拉筋shuliang = doorCount * 2 * quantity
        if (info.doorCount) {
          result[i]!.shuliang = String(Number(info.doorCount) * 2 * qty)
        } else {
          result[i]!.shuliang = ''
        }
      }
    }

    // 计算横拉的规格值：横拉规格 = width - 140
    // 横拉shuliang = 固定值1 * quantity
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '横拉') {
        if (info.width) {
          result[i]!.guige = String(Number(info.width) - 140)
        }
        result[i]!.shuliang = String(1 * qty)
      }
    }

    // 计算门料的规格值：第一个门料规格 = (length - 80 - (doorCount + 1) * 2) / doorCount，第二个门料规格 = height - 25
    // 门料shuliang = doorCount * 2
    let menLiaoIdx = 0
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '门料') {
        menLiaoIdx++
        if (menLiaoIdx === 1 && info.length && info.doorCount) {
          // 第一个门料：规格 = (长度 - 80 - (门数量 + 1) * 2) / 门数量，保留小数点后一位
          const doorCount = Number(info.doorCount)
          if (doorCount > 0) {
            result[i]!.guige = ((Number(info.length) - 80 - (doorCount + 1) * 2) / doorCount).toFixed(1)
          }
        } else if (menLiaoIdx === 2 && info.height) {
          result[i]!.guige = String(Number(info.height) - 25)
        }
        // 门料shuliang = doorCount * 2 * quantity（所有门料行共享同一个shuliang值）
        if (info.doorCount) {
          result[i]!.shuliang = String(Number(info.doorCount) * 2 * qty)
        } else {
          result[i]!.shuliang = ''
        }
      }
    }

    // 计算侧板的规格值：第一个侧板规格 = width - 85，第二个侧板规格 = height - 1
    // 侧板shuliang = 固定值4 * quantity
    let ceBanIdx = 0
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '侧板') {
        ceBanIdx++
        if (ceBanIdx === 1 && info.width) {
          // 第一个侧板：规格 = 宽度 - 85
          result[i]!.guige = String(Number(info.width) - 85)
        } else if (ceBanIdx === 2 && info.height) {
          // 第二个侧板：规格 = 高度 - 1
          result[i]!.guige = String(Number(info.height) - 1)
        }
        result[i]!.shuliang = String(4 * qty)
      }
    }

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

  // 根据不生成的配件名称过滤底部门板数据
  const filteredDoorPanelRows = computed(() => {
    return doorPanelRows.value.filter((row) => !excludeDoorPanelsRef.value.includes(row.name))
  })

  // 直接根据配件数据中的allAccessories生成配件表行（每行3个配件，共6列）
  const accessoryRows = computed(() => {
    const rows: {
      name1: string
      value1: string
      name2: string
      value2: string
      name3: string
      value3: string
    }[] = []
    for (let i = 0; i < allAccessories.length; i += 3) {
      rows.push({
        name1: allAccessories[i]?.name || '',
        value1: allAccessories[i]?.value || '',
        name2: allAccessories[i + 1]?.name || '',
        value2: allAccessories[i + 1]?.value || '',
        name3: allAccessories[i + 2]?.name || '',
        value3: allAccessories[i + 2]?.value || '',
      })
    }
    return rows
  })

  // 监听基本信息变化及下拉框排除变化，自动计算侧门板和配件的数据值
  watch(
    () => [info.width, info.height, info.length, info.doorCount, info.zhongCount, info.quantity, excludeNamesRef.value, excludeDoorPanelsRef.value],
    () => {
      const qty = Number(info.quantity) || 1

      const ceMenBan = doorPanelRows.value.find((row) => row.name === '侧门板')
      if (ceMenBan) {
        // 第一个侧板的guige = width - 85，侧门板shuju1 = 第一个侧板guige - 2.8
        if (info.width) {
          ceMenBan.shuju1 = String(Number(info.width) - 85 - 2.8)
        } else {
          ceMenBan.shuju1 = ''
        }
        // 第二个侧板的guige = height - 1，侧门板shuju2 = 第二个侧板guige - 2.8
        if (info.height) {
          ceMenBan.shuju2 = String(Number(info.height) - 1 - 2.8)
        } else {
          ceMenBan.shuju2 = ''
        }
        // 侧门板shuliang = 固定值2 * quantity
        ceMenBan.shuliang = String(2 * qty)
      }

      // 门板shuliang = doorCount * quantity
      const menBan = doorPanelRows.value.find((row) => row.name === '门板')
      if (menBan) {
        menBan.shuliang = info.doorCount ? String(Number(info.doorCount) * qty) : ''
      }

      // 门板shuju1 = 第一个门料的guige值 - 2.8 = ((length - 80 - (doorCount + 1) * 2) / doorCount) - 2.8
      if (menBan && info.length && info.doorCount) {
        const doorCount = Number(info.doorCount)
        if (doorCount > 0) {
          const menLiaoGuige = (Number(info.length) - 80 - (doorCount + 1) * 2) / doorCount
          menBan.shuju1 = (menLiaoGuige - 2.8).toFixed(1)
        }
      } else if (menBan) {
        menBan.shuju1 = ''
      }

      // 门板shuju2 = 第二个门料的规格值 - 2.8 = (height - 25) - 2.8
      if (menBan && info.height) {
        menBan.shuju2 = String(Number(info.height) - 25 - 2.8)
      } else if (menBan) {
        menBan.shuju2 = ''
      }

      // 上包转角的value = 上包边shuliang(2 * qty) * 2
      const isShangBaoBianExcluded = excludeNamesRef.value.includes('上包边')
      const shangBaoZhuanJiao = allAccessories.find((item) => item.name === '上包转角')
      if (shangBaoZhuanJiao) {
        if (!isShangBaoBianExcluded) {
          shangBaoZhuanJiao.value = String(2 * qty * 2)
        } else {
          shangBaoZhuanJiao.value = '0'
        }
      }

      // 下包转角的value = 下包边shuliang(2 * qty) * 2
      const isXiaBaoBianExcluded = excludeNamesRef.value.includes('下包边')
      const xiaBaoZhuanJiao = allAccessories.find((item) => item.name === '下包转角')
      if (xiaBaoZhuanJiao) {
        if (!isXiaBaoBianExcluded) {
          xiaBaoZhuanJiao.value = String(2 * qty * 2)
        } else {
          xiaBaoZhuanJiao.value = '0'
        }
      }

      // 背板shuliang = (zhongCount + 1) * quantity
      const beiBan = doorPanelRows.value.find((row) => row.name === '背板')
      if (beiBan) {
        beiBan.shuliang = info.zhongCount ? String((Number(info.zhongCount) + 1) * qty) : ''
      }

      // 背板shuju1 = (length - 80 - zhongCount * 38) / (zhongCount + 1) + 5
      if (beiBan && info.length && info.zhongCount) {
        const zhongCount = Number(info.zhongCount)
        beiBan.shuju1 = String((Number(info.length) - 80 - zhongCount * 38) / (zhongCount + 1) + 5)
      } else if (beiBan) {
        beiBan.shuju1 = ''
      }

      // 背板shuju2 = height - 85.5
      if (beiBan && info.height) {
        beiBan.shuju2 = String(Number(info.height) - 85.5)
      } else if (beiBan) {
        beiBan.shuju2 = ''
      }
    },
    { immediate: true }
  )

return { info, filteredTableData, mergeMethod, accessoryRows, doorPanelRows, filteredDoorPanelRows, getImage, saveToLocalStorage, tableData, allAccessories, imageModules }
}
