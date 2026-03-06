import { reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

// 批量导入JPG文件夹下的所有图片
const imageModules = import.meta.glob('../../JPG/*.jpg', { eager: true, import: 'default' }) as Record<string, string>

// 根据型号获取对应图片路径
const getImage = (xinghao: string) => {
  // 匹配键名中包含该型号的图片
  const key = Object.keys(imageModules).find(k => k.includes(xinghao))
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
    remark: '背留空'
  })

  // 主表格数据
  const tableData = [
    { xinghao: 'H-1071', tupian: 'H-1071', mingcheng: '上包边', guige: '1416', shuliang: '2', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
    { xinghao: 'H-1071', tupian: 'H-1071', mingcheng: '上包边', guige: '516', shuliang: '2', beizhu: '打磨喷漆', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

    { xinghao: 'H-1072', tupian: 'H-1072', mingcheng: '下包边', guige: '1416', shuliang: '2', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
    { xinghao: 'H-1072', tupian: 'H-1072', mingcheng: '下包边', guige: '516', shuliang: '2', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

    { xinghao: 'H-1073', tupian: 'H-1073', mingcheng: '立柱', guige: '897', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1074', tupian: 'H-1074', mingcheng: '前后横梁', guige: '1420', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1075', tupian: 'H-1075', mingcheng: '侧横梁', guige: '460', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1076', tupian: 'H-1076', mingcheng: '中柱', guige: '810', shuliang: '4', beizhu: '冲孔', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1005', tupian: 'H-1005', mingcheng: '拉筋', guige: '498', shuliang: '6', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1005', tupian: 'H-1005', mingcheng: '横拉', guige: '460', shuliang: '1', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

    { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '470.7', shuliang: '6', beizhu: '45度切', _mergeXinghao: 4, _mergeTupian: 4, _mergeMingcheng: 4 },
    { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '875', shuliang: '6', beizhu: '一半冲孔', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },
    { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '515', shuliang: '4', beizhu: '45度切', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },
    { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '899', shuliang: '4', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

  ]

  // 根据不生成的名称过滤表格数据，并重新计算合并单元格
  const filteredTableData = computed(() => {
    // 过滤掉被排除的名称对应的行
    const filtered = tableData.filter(row => !excludeNames.includes(row.mingcheng))

    // 重新计算合并标记
    const result = filtered.map((row, index) => ({ ...row }))
    for (let i = 0; i < result.length; i++) {
      const currentRow = result[i]
      if (!currentRow) continue
      // 计算当前行开始，连续相同名称的行数
      let count = 1
      while (i + count < result.length) {
        const nextRow = result[i + count]
        if (!nextRow || currentRow.mingcheng !== nextRow.mingcheng || currentRow.xinghao !== nextRow.xinghao) {
          break
        }
        count++
      }
      // 第一行设置 rowspan = count，后续行设置为 0（被合并）
      currentRow._mergeXinghao = count
      currentRow._mergeTupian = count
      currentRow._mergeMingcheng = count
      for (let j = 1; j < count; j++) {
        const mergedRow = result[i + j]
        if (mergedRow) {
          mergedRow._mergeXinghao = 0
          mergedRow._mergeTupian = 0
          mergedRow._mergeMingcheng = 0
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
      const mergeKey = columnIndex === 0 ? '_mergeXinghao' : columnIndex === 1 ? '_mergeTupian' : '_mergeMingcheng'
      if (row[mergeKey] > 0) {
        return { rowspan: row[mergeKey], colspan: 1 }
      } else if (row[mergeKey] === 0) {
        return { rowspan: 0, colspan: 0 }
      }
    }

    return { rowspan: 1, colspan: 1 }
  }

  // 完整配件数据映射（名称 -> 默认数量）
  const allAccessories: { name: string; value: string }[] = [
    { name: '上包转角', value: '4' },
    { name: '下包转角', value: '4' },
    { name: '三卡锁', value: '' },
    { name: '堵头(分左右)', value: '' },
    { name: '角码', value: '' },
    { name: '反弹器', value: '' },
    { name: '大弯铰链', value: '' },
    { name: '直臂铰链', value: '4' },
    { name: '铰链垫块', value: '4' },
    { name: '4*10螺丝', value: '4' },
    { name: '4*19螺丝', value: '4' },
  ]

  // 根据value5选中的配件动态生成配件表行（每行3个配件，共6列）
  const accessoryRows = computed(() => {
    // 过滤出用户选中的配件
    const selected = allAccessories.filter(item => includeAccessories.includes(item.name))
    // 每行放3个配件
    const rows: { name1: string; value1: string; name2: string; value2: string; name3: string; value3: string }[] = []
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

  return { info, filteredTableData, mergeMethod, accessoryRows, getImage }
}
