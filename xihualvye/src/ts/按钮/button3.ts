/**
 * 需要设置较高行高(28px)的名称列表
 * 包含：上包边、下包边、门料、侧板、门板、侧门板、背板
 */
const TALL_ROW_NAMES = ['上包边', '下包边', '门料', '侧板', '门板', '侧门板', '背板']

/**
 * 通用打印表格函数 - 调用浏览器打印功能
 * 配合 CSS 中的 @media print 样式，隐藏非表格区域，只打印表格内容
 * 打印前根据名称列内容，为不同行添加不同的行高类名
 */
export function printTable() {
  // 记录所有被添加类名的行，打印后需要恢复
  const taggedRows: { row: HTMLElement; className: string }[] = []

  // ===== 1. 处理主表格（el-table）的行 =====
  const mainTable = document.querySelector('.main-table')
  if (mainTable) {
    const rows = mainTable.querySelectorAll('.el-table__body tbody tr')
    rows.forEach((tr) => {
      const cells = tr.querySelectorAll('td')
      // 遍历该行所有单元格，查找名称列的文本内容
      let rowName = ''
      for (const cell of cells) {
        const text = cell.textContent?.trim() || ''
        if (TALL_ROW_NAMES.includes(text)) {
          rowName = text
          break
        }
      }

      if (TALL_ROW_NAMES.includes(rowName)) {
        ;(tr as HTMLElement).classList.add('print-row-tall')
        taggedRows.push({ row: tr as HTMLElement, className: 'print-row-tall' })
      } else {
        ;(tr as HTMLElement).classList.add('print-row-short')
        taggedRows.push({ row: tr as HTMLElement, className: 'print-row-short' })
      }
    })
  }

  // ===== 2. 处理底部门板表格的行 =====
  const doorPanelTable = document.querySelector('.door-panel-table')
  if (doorPanelTable) {
    const rows = doorPanelTable.querySelectorAll('tr')
    rows.forEach((tr) => {
      const cells = tr.querySelectorAll('td')
      let rowName = ''
      for (const cell of cells) {
        const text = cell.textContent?.trim() || ''
        if (TALL_ROW_NAMES.includes(text)) {
          rowName = text
          break
        }
      }

      if (TALL_ROW_NAMES.includes(rowName)) {
        ;(tr as HTMLElement).classList.add('print-row-tall')
        taggedRows.push({ row: tr as HTMLElement, className: 'print-row-tall' })
      } else {
        ;(tr as HTMLElement).classList.add('print-row-short')
        taggedRows.push({ row: tr as HTMLElement, className: 'print-row-short' })
      }
    })
  }

  // 执行打印
  window.print()

  // 打印后：移除所有添加的类名，不影响正常显示
  for (const { row, className } of taggedRows) {
    row.classList.remove(className)
  }
}
