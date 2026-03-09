import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

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
  doorPanelRows: Array<{ name: string; shuju1: string; shuju2: string; shuliang: string; beizhu: string }>,
  allAccessories: Array<{ name: string; value: string }>,
  imageModules?: Record<string, string>
) {
  const workbook = new ExcelJS.Workbook()
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
  ws.columns = [
    { width: 12 },  // 列A: 型号
    { width: 18 },  // 列B: 图片（稍宽以容纳图片）
    { width: 12 },  // 列C: 名称
    { width: 12 },  // 列D: 规格
    { width: 10 },  // 列E: 数量
    { width: 12 },  // 列F: 备注
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
  const IMAGE_ROW_HEIGHT = 55 // 有图片的行高度

  for (const row of filteredTableData) {
    const rowData = [row.xinghao, '', row.mingcheng, row.guige, row.shuliang, row.beizhu]
    for (let c = 0; c < 6; c++) {
      ws.getCell(rowIdx, c + 1).value = rowData[c]
    }
    setRowStyle(rowIdx)

    // 嵌入图片到图片列（列B = 第2列）
    if (row.tupian && imageCache.has(row.tupian)) {
      const imageBuffer = imageCache.get(row.tupian)!
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: 'jpeg',
      })

      // 设置行高以容纳图片
      ws.getRow(rowIdx).height = IMAGE_ROW_HEIGHT

      // 将图片嵌入到单元格中
      // tl = top-left 左上角, br = bottom-right 右下角
      // col/row 使用0基索引，列B = 索引1
      // 注意：ExcelJS 运行时支持 {col, row} 简写，但类型定义要求 Anchor，用 as any 绕过
      ws.addImage(imageId, {
        tl: { col: 1.05, row: rowIdx - 1 + 0.05 } as any,
        br: { col: 1.95, row: rowIdx - 0.05 } as any,
        editAs: 'oneCell',
      })
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

    // 图片列合并（列B=2）- 合并后图片会自动跨越合并区域
    if (row._mergeTupian !== undefined && row._mergeTupian > 1) {
      ws.mergeCells(r, 2, r + row._mergeTupian - 1, 2)

      // 如果图片列需要合并多行，重新调整图片大小以覆盖合并区域
      if (row.tupian && imageCache.has(row.tupian)) {
        // 删除之前添加的单行图片，重新添加一个覆盖合并区域的图片
        // ExcelJS不支持删除已添加的图片，所以我们在前面添加时不添加会被合并的图片
        // 这里重新添加一个大图覆盖合并区域
        const imageBuffer = imageCache.get(row.tupian)!
        const mergedImageId = workbook.addImage({
          buffer: imageBuffer,
          extension: 'jpeg',
        })
        ws.addImage(mergedImageId, {
          tl: { col: 1.05, row: r - 1 + 0.05 } as any,
          br: { col: 1.95, row: r - 1 + row._mergeTupian - 0.05 } as any,
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
        allAccessories[j]?.name || '', allAccessories[j]?.value || '',
        allAccessories[j + 1]?.name || '', allAccessories[j + 1]?.value || '',
        allAccessories[j + 2]?.name || '', allAccessories[j + 2]?.value || '',
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
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, fileName)
}
