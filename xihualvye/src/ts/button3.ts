/**
 * 通用打印表格函数 - 调用浏览器打印功能
 * 配合 CSS 中的 @media print 样式，隐藏非表格区域，只打印表格内容
 * 打印前自动调整主表格数量列（第5列）宽度，打印后恢复
 */
export function printTable() {
  // 打印前：查找主表格的 colgroup col，修改数量列（第5列）宽度
  // const mainTable = document.querySelector('.main-table')
  // const cols = mainTable?.querySelectorAll('colgroup col')
  // const originalWidths: string[] = []

  // if (cols && cols.length >= 5) {
  //   cols.forEach((col) => {
  //     originalWidths.push((col as HTMLElement).style.width)
  //   })
  //   // 第5列（index=4）是数量列，调大宽度
  //   ;(cols[4] as HTMLElement).style.width = '95px'
  // }

  window.print()

  // 打印后：恢复原始宽度，不影响正常显示
  // if (cols && originalWidths.length > 0) {
  //   cols.forEach((col, i) => {
  //     ;(col as HTMLElement).style.width = originalWidths[i] ?? ''
  //   })
  // }
}
