// exceljs 和 file-saver 体积较大（合计 900KB+），仅在用户点击"下载表格"时才需要。
// 这里只做类型导入，运行时实例在函数内部 dynamic import 加载。
import type ExcelJS from 'exceljs'

/**
 * 将图片URL转换为ArrayBuffer（用于ExcelJS嵌入图片）
 * 通过fetch获取Vite处理后的图片，在浏览器内存中转换，无需下载到本地
 */
async function fetchImageAsArrayBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return arrayBuffer
  } catch {
    console.warn('图片加载失败:', url)
    return null
  }
}

/**
 * 通用下载表格函数 - 将页面表格数据导出为xlsx文件（使用ExcelJS，支持图片嵌入）
 * 按照图片中的排版布局生成，6列：型号 | 图片 | 名称 | 规格 | 数量 | 备注
 * @param title - 表格标题
 * @param info - 基本信息
 * @param filteredTableData - 主表格数据（经过过滤和计算的）
 * @param doorPanelRows - 底部门板数据
 * @param allAccessories - 配件数据
 * @param imageModules - 图片模块映射（import.meta.glob 返回的对象）
 */
export async function downloadTable(
  title: string,
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
  filteredTableData: Array<{
    xinghao: string
    tupian?: string
    mingcheng: string
    guige: string
    shuliang: string
    beizhu: string
    _mergeXinghao?: number
    _mergeTupian?: number
    _mergeMingcheng?: number
    _mergeShuliang?: number
    _mergeBeizhu?: number
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
  imageModules?: Record<string, string>,
) {
  // 动态加载大体积依赖：避免进入首屏 bundle
  const [{ default: ExcelJSImpl }, { saveAs }] = await Promise.all([
    import('exceljs'),
    import('file-saver'),
  ])

  const workbook = new ExcelJSImpl.Workbook()
  const ws = workbook.addWorksheet('表格数据')

  // 通用边框样式
  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  }

  // 通用居中对齐
  const centerAlignment: Partial<ExcelJS.Alignment> = {
    horizontal: 'center',
    vertical: 'middle',
    wrapText: true,
  }

  // 设置列宽
  const IMAGE_COL_WIDTH = 26 // 图片列宽度（Excel字符宽度单位）
  ws.columns = [
    { width: 10 }, // 列A: 型号（缩小列宽）
    { width: IMAGE_COL_WIDTH }, // 列B: 图片（加宽以容纳图片）
    { width: 10 }, // 列C: 名称
    { width: 12 }, // 列D: 规格
    { width: 10 }, // 列E: 数量
    { width: 12 }, // 列F: 备注
  ]

  // 辅助函数：为一行的所有6列设置样式
  const setRowStyle = (rowNum: number, font?: Partial<ExcelJS.Font>) => {
    for (let c = 1; c <= 6; c++) {
      const cell = ws.getCell(rowNum, c)
      cell.alignment = centerAlignment
      cell.border = thinBorder
      if (font) cell.font = font
    }
  }

  let rowIdx = 1 // ExcelJS 行号从1开始

  // ========== 1. 标题行（合并6列） ==========
  ws.mergeCells(rowIdx, 1, rowIdx, 6)
  ws.getCell(rowIdx, 1).value = title
  setRowStyle(rowIdx, { bold: true, size: 14 })
  ws.getRow(rowIdx).height = 30
  rowIdx++

  // ========== 2. 基本信息区 ==========
  // 第一行：客户：| 值(合并2列) | 日期：| 值(合并2列)
  ws.mergeCells(rowIdx, 2, rowIdx, 3)
  ws.mergeCells(rowIdx, 5, rowIdx, 6)
  ws.getCell(rowIdx, 1).value = '客户：'
  ws.getCell(rowIdx, 2).value = info.customer
  ws.getCell(rowIdx, 4).value = '日期：'
  ws.getCell(rowIdx, 5).value = info.date
  setRowStyle(rowIdx)
  rowIdx++

  // 第二行：表面：| 值 | 数量：| 值 | 客户单号：| 值
  const infoRow2 = ['表面：', info.surface, '数量：', info.quantity, '客户单号：', info.orderNo]
  for (let c = 0; c < 6; c++) {
    ws.getCell(rowIdx, c + 1).value = infoRow2[c]
  }
  setRowStyle(rowIdx)
  rowIdx++

  // 第三行：长度：| 值 | 宽度：| 值 | 高度：| 值
  const infoRow3 = ['长度：', info.length, '宽度：', info.width, '高度：', info.height]
  for (let c = 0; c < 6; c++) {
    ws.getCell(rowIdx, c + 1).value = infoRow3[c]
  }
  setRowStyle(rowIdx)
  rowIdx++

  // ========== 3. 主表格表头 ==========
  const headers = ['型号', '图片', '名称', '规格', '数量', '备注']
  for (let c = 0; c < 6; c++) {
    ws.getCell(rowIdx, c + 1).value = headers[c]
  }
  setRowStyle(rowIdx, { bold: true })
  rowIdx++

  // ========== 4. 预加载所有图片 ==========
  // 收集所有需要的图片型号（去重）
  const imageCache: Map<string, ArrayBuffer> = new Map()
  if (imageModules) {
    const xinghaoSet = new Set<string>()
    for (const row of filteredTableData) {
      if (row.tupian) xinghaoSet.add(row.tupian)
    }
    // 并行获取所有图片数据（在浏览器内存中完成，不需要下载到本地文件）
    const promises = Array.from(xinghaoSet).map(async (xinghao) => {
      const key = Object.keys(imageModules).find((k) => k.includes(xinghao))
      if (key) {
        const url = imageModules[key]
        if (url) {
          const buffer = await fetchImageAsArrayBuffer(url)
          if (buffer) {
            imageCache.set(xinghao, buffer)
          }
        }
      }
    })
    await Promise.all(promises)
  }

  // ========== 5. 主表格数据（含图片嵌入） ==========
  const mainTableStartRow = rowIdx
  const IMAGE_ROW_HEIGHT = 60 // 有图片的行高度

  // 将Excel列宽/行高转换为像素的辅助函数
  // Excel列宽1个字符单位 ≈ 7.5像素；行高1个点 ≈ 1.33像素
  const colWidthToPixel = (w: number) => Math.round(w * 7.5)
  const rowHeightToPixel = (h: number) => Math.round(h * 1.33)

  // 像素转点（ExcelJS的ext.width/height单位是点）
  // 1像素 ≈ 0.75点（96DPI下）
  const pixelToPoint = (px: number) => px * 0.75

  // 先收集需要合并的图片行信息，避免重复添加图片
  const mergedTupianRows = new Set<number>() // 记录哪些行是被合并图片列覆盖的子行
  for (let i = 0; i < filteredTableData.length; i++) {
    const row = filteredTableData[i]
    if (!row) continue
    if (row._mergeTupian !== undefined && row._mergeTupian > 1) {
      // 记录该合并区域内的所有子行（不含首行）
      for (let j = 1; j < row._mergeTupian; j++) {
        mergedTupianRows.add(i + j)
      }
    }
  }

  for (let i = 0; i < filteredTableData.length; i++) {
    const row = filteredTableData[i]
    if (!row) continue
    const rowData = [row.xinghao, '', row.mingcheng, row.guige, row.shuliang, row.beizhu]
    for (let c = 0; c < 6; c++) {
      ws.getCell(rowIdx, c + 1).value = rowData[c]
    }
    setRowStyle(rowIdx)

    // 设置有图片的行高度（包括合并区域内的子行也需要设置行高）
    if (row.tupian && imageCache.has(row.tupian)) {
      ws.getRow(rowIdx).height = IMAGE_ROW_HEIGHT
    } else if (mergedTupianRows.has(i)) {
      // 合并区域内的子行也需要设置相同行高，确保合并区域总高度足够
      ws.getRow(rowIdx).height = IMAGE_ROW_HEIGHT
    }

    // 只在非合并子行时添加图片（合并行的图片在后续合并处理中统一添加）
    if (row.tupian && imageCache.has(row.tupian) && !mergedTupianRows.has(i)) {
      // 检查是否有合并，如果有合并则跳过（后续统一添加大图）
      if (row._mergeTupian === undefined || row._mergeTupian <= 1) {
        const imageBuffer = imageCache.get(row.tupian)!
        const imageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'jpeg',
        })
        // 将图片嵌入到单元格中，居中显示（允许拉伸变形）
        const padding = 5 // 四周留5像素边距
        const imgWidthPx = colWidthToPixel(IMAGE_COL_WIDTH) - padding * 2
        const imgHeightPx = rowHeightToPixel(IMAGE_ROW_HEIGHT) - padding * 2
        // 计算居中偏移量
        const leftOffset = padding / colWidthToPixel(IMAGE_COL_WIDTH)
        const topOffset = padding / rowHeightToPixel(IMAGE_ROW_HEIGHT)
        ws.addImage(imageId, {
          tl: { col: 1 + leftOffset, row: rowIdx - 1 + topOffset } as any,
          ext: { width: pixelToPoint(imgWidthPx), height: pixelToPoint(imgHeightPx) },
          editAs: 'oneCell',
        })
      }
    }

    rowIdx++
  }

  // ========== 6. 处理主表格的合并单元格 ==========
  for (let i = 0; i < filteredTableData.length; i++) {
    const row = filteredTableData[i]
    if (!row) continue
    const r = mainTableStartRow + i

    // 型号列合并（列A=1）
    if (row._mergeXinghao !== undefined && row._mergeXinghao > 1) {
      ws.mergeCells(r, 1, r + row._mergeXinghao - 1, 1)
    }

    // 图片列合并（列B=2）- 合并后添加覆盖整个合并区域的大图
    if (row._mergeTupian !== undefined && row._mergeTupian > 1) {
      ws.mergeCells(r, 2, r + row._mergeTupian - 1, 2)

      // 添加覆盖合并区域的大图（在数据遍历阶段已跳过这些行的图片添加）
      if (row.tupian && imageCache.has(row.tupian)) {
        const imageBuffer = imageCache.get(row.tupian)!
        const mergedImageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'jpeg',
        })
        // 合并区域图片居中显示在合并单元格内
        const padding = 5
        const mergedImgWidthPx = colWidthToPixel(IMAGE_COL_WIDTH) - padding * 2
        const mergedAreaHeightPx = rowHeightToPixel(IMAGE_ROW_HEIGHT * row._mergeTupian)
        const mergedImgHeightPx = mergedAreaHeightPx - padding * 2
        // 计算居中偏移量
        const leftOffset = padding / colWidthToPixel(IMAGE_COL_WIDTH)
        const topOffset = padding / mergedAreaHeightPx
        ws.addImage(mergedImageId, {
          tl: { col: 1 + leftOffset, row: r - 1 + topOffset } as any,
          ext: { width: pixelToPoint(mergedImgWidthPx), height: pixelToPoint(mergedImgHeightPx) },
          editAs: 'oneCell',
        })
      }
    }

    // 名称列合并（列C=3）
    if (row._mergeMingcheng !== undefined && row._mergeMingcheng > 1) {
      ws.mergeCells(r, 3, r + row._mergeMingcheng - 1, 3)
    }

    // 数量列合并（列E=5）
    if (row._mergeShuliang !== undefined && row._mergeShuliang > 1) {
      ws.mergeCells(r, 5, r + row._mergeShuliang - 1, 5)
    }

    // 备注列合并（列F=6）
    if (row._mergeBeizhu !== undefined && row._mergeBeizhu > 1) {
      ws.mergeCells(r, 6, r + row._mergeBeizhu - 1, 6)
    }
  }

  // ========== 7. 底部门板数据 ==========
  if (doorPanelRows.length > 0) {
    for (const row of doorPanelRows) {
      // 名称占列A+B合并
      ws.mergeCells(rowIdx, 1, rowIdx, 2)
      ws.getCell(rowIdx, 1).value = row.name
      ws.getCell(rowIdx, 3).value = row.shuju1
      ws.getCell(rowIdx, 4).value = row.shuju2
      ws.getCell(rowIdx, 5).value = row.shuliang
      ws.getCell(rowIdx, 6).value = row.beizhu
      setRowStyle(rowIdx)
      rowIdx++
    }
  }

  // ========== 8. 配件表 ==========
  if (allAccessories.length > 0) {
    // 配件表标题行（合并6列）
    ws.mergeCells(rowIdx, 1, rowIdx, 6)
    ws.getCell(rowIdx, 1).value = '配件表'
    setRowStyle(rowIdx, { bold: true })
    rowIdx++

    // 每行3个配件，每个配件占2列（名称+数量）
    for (let j = 0; j < allAccessories.length; j += 3) {
      const accData = [
        allAccessories[j]?.name || '',
        allAccessories[j]?.value || '',
        allAccessories[j + 1]?.name || '',
        allAccessories[j + 1]?.value || '',
        allAccessories[j + 2]?.name || '',
        allAccessories[j + 2]?.value || '',
      ]
      for (let c = 0; c < 6; c++) {
        ws.getCell(rowIdx, c + 1).value = accData[c]
      }
      setRowStyle(rowIdx)
      rowIdx++
    }
  }

  // ========== 9. 工艺备注 ==========
  ws.mergeCells(rowIdx, 1, rowIdx, 6)
  ws.getCell(rowIdx, 1).value = '工艺备注'
  setRowStyle(rowIdx, { bold: true })
  rowIdx++

  ws.mergeCells(rowIdx, 1, rowIdx, 6)
  ws.getCell(rowIdx, 1).value = info.remark || ''
  setRowStyle(rowIdx)

  // ========== 生成并下载文件 ==========
  const fileName = `${title}${info.customer ? '_' + info.customer : ''}${info.orderNo ? '_' + info.orderNo : ''}.xlsx`
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, fileName)
}
