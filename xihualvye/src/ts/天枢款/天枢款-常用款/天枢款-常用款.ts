import { reactive, computed, watch, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tableData as DEFAULT_TABLE_DATA } from './天枢款-常用款-主表格数据'
import { allAccessories as DEFAULT_ACCESSORIES } from './天枢款-常用款-配件数据'
import { doorPanelRows as DEFAULT_DOOR_PANELS } from './天枢款-常用款-底部门板数据'
import { getImageByXinghao, buildImageModulesForExport } from '@/ts/image-loader'

// 本地存储 key 生成函数
const getStorageKey = (customer: string, orderNo: string) => {
  return `tianshu_${customer}_${orderNo}`
}

// 图片懒加载（替代之前 eager: true 的 import.meta.glob）：
// 第一次访问 getImage(xinghao) 时返回 '' 同时异步加载，加载完成后响应式缓存驱动模板刷新。
const getImage = (xinghao: string) => getImageByXinghao(xinghao)

// 深拷贝工具：仅复制纯数据对象/数组
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function useChangyongBiaoge() {
  const route = useRoute()

  // 从路由参数中获取不生成的名称列表作为初始值
  const initialExcludeNames: string[] = (() => {
    try {
      const raw = route.query.excludeNames as string
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })()

  // 不生成的名称列表（主表格），页面内下拉框可动态控制
  const excludeNames = ref<string[]>(initialExcludeNames)

  // 不生成的名称列表（底部门板：门板、侧门板等），页面内下拉框可动态控制
  const excludeDoorPanels = ref<string[]>([])

  // ============ 页面独立的响应式副本（每个页面实例都拿到一份独立数据，不再共用全局单例）============
  // 之前：tableData / doorPanelRows / allAccessories 都是模块顶层导出的全局单例，
  //   A 页面修改后切换到 B 页面会看到脏状态，且 tableData 不是响应式还要靠版本号触发重算。
  // 现在：以模块导出作为 DEFAULT 模板，hook 内部生成独立的 reactive / ref 副本。
  const tableData = reactive(deepClone(DEFAULT_TABLE_DATA)) as typeof DEFAULT_TABLE_DATA
  const doorPanelRows = ref(deepClone(DEFAULT_DOOR_PANELS.value))
  const allAccessories = reactive(deepClone(DEFAULT_ACCESSORIES)) as typeof DEFAULT_ACCESSORIES

  // 兼容老调用：vue 页面以前依赖 bumpTableDataVersion() 手动触发 computed 重算，
  // 现在 tableData 已是 reactive，splice 会自动触发；保留 noop 函数让 vue 调用方零改动。
  function bumpTableDataVersion() {
    /* no-op: tableData 现在是 reactive，无需手动 bump */
  }

  // "背板一块"模式开关（由 vue 同步写入）
  const isBeibanOneMode = ref(false)

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
    beibanCount: '',
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
    // tableData 现在是 reactive，splice / push 会自动触发重算，无需额外的版本号依赖。

    // 数量倍率：所有 shuliang 都要乘以 quantity
    const qty = Number(info.quantity) || 1

    // 过滤掉被排除的名称对应的行
    const filtered = tableData.filter((row) => !excludeNames.value.includes(row.mingcheng))

    // 重新计算合并标记
    const result = filtered.map((row) => ({ ...row }))

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

    // 计算中柱的规格值：中柱规格 = height - 90
    // 普通模式：shuliang = (doorCount - 1) * 2 * qty
    // 背板一块模式：shuliang = (门板数量-1)*2/2 + 背板数量-1
    const beibanOne = isBeibanOneMode.value
    let zhongZhuIdx = 0
    let zhongZhuShuliang = ''
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '中柱') {
        zhongZhuIdx++
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        }
        if (zhongZhuIdx === 1) {
          if (beibanOne) {
            // 背板一块模式公式
            const d = Number(info.doorCount) || 0
            const b = Number(info.beibanCount) || 0
            zhongZhuShuliang = (d > 0 || b > 0) ? String(((d - 1) * 2) / 2 + (b - 1)) : ''
            result[i]!.shuliang = zhongZhuShuliang
          } else if (info.doorCount) {
            zhongZhuShuliang = String((Number(info.doorCount) - 1) * 2 * qty)
            result[i]!.shuliang = zhongZhuShuliang
          } else {
            result[i]!.shuliang = ''
          }
        } else if (zhongZhuIdx === 2) {
          result[i]!.shuliang = zhongZhuShuliang
        }
      }
    }

    // 计算小中柱（仅背板一块模式插入）：guige = height - 90，shuliang = 中柱新数量
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '小中柱') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        } else {
          result[i]!.guige = ''
        }
        result[i]!.shuliang = zhongZhuShuliang
      }
    }

    // 计算加固的规格值：加固规格 = height - 90（数量由用户手动输入，不重置）
    for (let i = 0; i < result.length; i++) {
      if (result[i] && result[i]!.mingcheng === '加固') {
        if (info.height) {
          result[i]!.guige = String(Number(info.height) - 90)
        } else {
          result[i]!.guige = ''
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
            result[i]!.guige = (
              (Number(info.length) - 80 - (doorCount + 1) * 2) /
              doorCount
            ).toFixed(1)
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
  const mergeMethod = ({ row, columnIndex }: any) => {
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

  // 计算额外配件数量（三卡锁、堵头(分左右)、角码），供 watch 和外部（vue 勾选新增配件时）调用
  const recalcExtraAccessories = () => {
    const qty = Number(info.quantity) || 1
    // 辅助：被排除的名称不计入
    const isExcluded = (name: string) => excludeNames.value.includes(name)

    // 各主表项对应的数量（与 filteredTableData 中 shuliang 计算口径保持一致）
    const qianHouHengLiang = isExcluded('前后横梁') ? 0 : 4 * qty // 前后横梁
    const ceHengLiang = isExcluded('侧横梁') ? 0 : 4 * qty // 侧横梁
    // 中柱：两行合计 = (doorCount - 1) * 2 * qty * 2
    const zhongZhuTotal =
      isExcluded('中柱') || !info.doorCount ? 0 : (Number(info.doorCount) - 1) * 2 * qty * 2
    // 拉筋：doorCount * 2 * qty
    const laJin =
      isExcluded('拉筋') || !info.doorCount ? 0 : Number(info.doorCount) * 2 * qty
    const hengLa = isExcluded('横拉') ? 0 : 1 * qty // 横拉
    const liZhu = isExcluded('立柱') ? 0 : 4 * qty // 立柱
    // 门料：两行合计 = doorCount * 2 * qty * 2
    const menLiaoTotal =
      isExcluded('门料') || !info.doorCount ? 0 : Number(info.doorCount) * 2 * qty * 2
    // 侧板：两行合计 = 4 * qty * 2
    const ceBanTotal = isExcluded('侧板') ? 0 : 4 * qty * 2

    // 三卡锁 = (前后横梁 + 侧横梁 + 中柱 + 拉筋 + 横拉) * 2
    const sanKaSuo = allAccessories.find((item) => item.name === '三卡锁')
    if (sanKaSuo) {
      sanKaSuo.value = String(
        (qianHouHengLiang + ceHengLiang + zhongZhuTotal + laJin + hengLa) * 2,
      )
    }

    // 堵头(分左右) = 立柱数量 * 2
    const duTou = allAccessories.find((item) => item.name === '堵头(分左右)')
    if (duTou) {
      duTou.value = String(liZhu * 2)
    }

    // 角码 = 门料第一个数量 + 门料第二个数量 + 侧板第一个数量 + 侧板第二个数量
    const jiaoMa = allAccessories.find((item) => item.name === '角码')
    if (jiaoMa) {
      jiaoMa.value = String(menLiaoTotal + ceBanTotal)
    }

    // 门数量（不乘 qty，按用户需求以门数量原始值计算）
    const doorCountNum = Number(info.doorCount) || 0

    // 铰链垫块 = 门数量 * 2
    const jiaoLianDianKuai = allAccessories.find((item) => item.name === '铰链垫块')
    if (jiaoLianDianKuai) {
      jiaoLianDianKuai.value = doorCountNum ? String(doorCountNum * 2) : '0'
    }

    // 反弹器 = 门数量
    const fanTanQi = allAccessories.find((item) => item.name === '反弹器')
    if (fanTanQi) {
      fanTanQi.value = doorCountNum ? String(doorCountNum) : '0'
    }

    // 直臂铰链 = (门数量 - 2) * 2，结果为负时取 0
    const zhiBiJiaoLianCount = doorCountNum >= 2 ? (doorCountNum - 2) * 2 : 0
    const zhiBiJiaoLian = allAccessories.find((item) => item.name === '直臂铰链')
    if (zhiBiJiaoLian) {
      zhiBiJiaoLian.value = String(zhiBiJiaoLianCount)
    }

    // 大弯铰链 = 门数量 * 2 - 直臂铰链
    const daWanJiaoLian = allAccessories.find((item) => item.name === '大弯铰链')
    if (daWanJiaoLian) {
      daWanJiaoLian.value = String(doorCountNum * 2 - zhiBiJiaoLianCount)
    }
  }

  // 监听基本信息变化，自动计算侧门板的数据值
  watch(
    () => [
      info.width,
      info.height,
      info.length,
      info.doorCount,
      info.quantity,
      excludeNames.value,
    ],
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

      // 上包转角的value = 上包边shuliang(2 * qty) * 2；若上包边被排除则为 0
      const shangBaoZhuanJiao = allAccessories.find((item) => item.name === '上包转角')
      if (shangBaoZhuanJiao) {
        shangBaoZhuanJiao.value = excludeNames.value.includes('上包边')
          ? '0'
          : String(2 * qty * 2)
      }

      // 下包转角的value = 下包边shuliang(2 * qty) * 2；若下包边被排除则为 0
      const xiaBaoZhuanJiao = allAccessories.find((item) => item.name === '下包转角')
      if (xiaBaoZhuanJiao) {
        xiaBaoZhuanJiao.value = excludeNames.value.includes('下包边')
          ? '0'
          : String(2 * qty * 2)
      }

      // 计算额外配件数量（三卡锁、堵头(分左右)、角码）
      recalcExtraAccessories()
    },
    { immediate: true },
  )

  // 过滤后的底部门板数据：根据 excludeDoorPanels 剔除对应行
  const filteredDoorPanelRows = computed(() =>
    doorPanelRows.value.filter((row) => !excludeDoorPanels.value.includes(row.name)),
  )

  return {
    info,
    filteredTableData,
    mergeMethod,
    accessoryRows,
    doorPanelRows,
    filteredDoorPanelRows,
    excludeNames,
    excludeDoorPanels,
    getImage,
    saveToLocalStorage,
    tableData,
    allAccessories,
    /**
     * 异步加载当前表格所需图片，返回与之前 imageModules 同结构的对象。
     * 仅在用户点击"下载表格"时调用，不会进入首屏 bundle。
     */
    loadImageModules: () => {
      const xinghaoList: string[] = [
        ...tableData.map((r: any) => r.tupian).filter(Boolean),
      ]
      return buildImageModulesForExport(xinghaoList)
    },
    recalcExtraAccessories,
    bumpTableDataVersion,
    isBeibanOneMode,
  }
}
