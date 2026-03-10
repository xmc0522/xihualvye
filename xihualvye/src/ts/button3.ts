/**
 * 通用打印表格函数 - 调用浏览器打印功能
 * 配合 CSS 中的 @media print 样式，隐藏非表格区域，只打印表格内容
 */
export function printTable() {
  window.print()
}
