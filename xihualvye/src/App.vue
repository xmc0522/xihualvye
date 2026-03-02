<script setup lang="ts">
import './css/table.css'
</script>

<template>
  <div class="table-container">
    <table class="data-table">
      <!-- 标题行 -->
      <tr>
        <td colspan="6" class="table-title">天枢款-圆弧</td>
      </tr>

      <!-- 客户/日期信息行 -->
      <tr class="info-row">
        <td class="info-label">客户：</td>
        <td colspan="2" class="info-value">中山乐事水族</td>
        <td class="info-label">日期：</td>
        <td colspan="2" class="info-value">2026/3/1</td>
      </tr>

      <!-- 表面/数量/规格信息行 -->
      <tr class="info-row">
        <td class="info-label">表面：</td>
        <td class="info-value">冰川白</td>
        <td class="info-label">数量：</td>
        <td class="info-value">3套</td>
        <td class="info-label">规格：</td>
        <td class="info-value">L-1545DY</td>
      </tr>

      <!-- 长度/宽度/高度信息行 -->
      <tr class="info-row">
        <td class="info-label">长度：</td>
        <td class="text-red">1518</td>
        <td class="info-label">宽度：</td>
        <td class="text-red">609</td>
        <td class="info-label">高度：</td>
        <td class="text-red">883</td>
      </tr>

      <!-- 表头行 -->
      <tr class="header-row">
        <td>型号</td>
        <td>图片</td>
        <td>名称</td>
        <td>规格</td>
        <td>数量</td>
        <td>备注</td>
      </tr>

      <!-- H-1055 新下包边 第一行 -->
      <tr class="data-row">
        <td class="col-model merged-cell" rowspan="2">H-1055</td>
        <td class="col-image merged-cell" rowspan="2"></td>
        <td class="col-name merged-cell" rowspan="2">新下包边</td>
        <td>1434</td>
        <td>6</td>
        <td class="col-remark" rowspan="2">打磨喷漆</td>
      </tr>
      <!-- H-1055 新下包边 第二行 -->
      <tr class="data-row">
        <td>525</td>
        <td>6</td>
      </tr>

      <!-- H-1073 立柱 -->
      <tr class="data-row">
        <td class="col-model">H-1073</td>
        <td class="col-image"></td>
        <td class="col-name">立柱</td>
        <td>880</td>
        <td>12</td>
        <td class="col-remark"></td>
      </tr>

      <!-- H-1074 前后横梁 -->
      <tr class="data-row">
        <td class="col-model">H-1074</td>
        <td class="col-image"></td>
        <td class="col-name">前后横梁</td>
        <td>1438</td>
        <td>12</td>
        <td class="col-remark"></td>
      </tr>

      <!-- H-1075 侧横梁 -->
      <tr class="data-row">
        <td class="col-model">H-1075</td>
        <td class="col-image"></td>
        <td class="col-name">侧横梁</td>
        <td>469</td>
        <td>12</td>
        <td class="col-remark merged-cell" rowspan="2">冲孔</td>
      </tr>

      <!-- H-1076 中柱 -->
      <tr class="data-row">
        <td class="col-model">H-1076</td>
        <td class="col-image"></td>
        <td class="col-name">中柱</td>
        <td>793</td>
        <td>12</td>
      </tr>

      <!-- H-1005 拉筋 -->
      <tr class="data-row">
        <td class="col-model">H-1005</td>
        <td class="col-image"></td>
        <td class="col-name">拉筋</td>
        <td>507</td>
        <td>18</td>
        <td class="col-remark"></td>
      </tr>

      <!-- H-1077 门料 第一行 -->
      <tr class="data-row">
        <td class="col-model merged-cell" rowspan="2">H-1077</td>
        <td class="col-image merged-cell" rowspan="2"></td>
        <td class="col-name merged-cell" rowspan="2">门料</td>
        <td>476.7</td>
        <td>18</td>
        <td class="col-remark highlight-yellow">45度切</td>
      </tr>
      <!-- H-1077 门料 第二行 -->
      <tr class="data-row">
        <td>858</td>
        <td>18</td>
        <td class="col-remark highlight-yellow">一半冲孔</td>
      </tr>

      <!-- H-1077 侧板 第一行 -->
      <tr class="data-row">
        <td class="col-model merged-cell" rowspan="2">H-1077</td>
        <td class="col-image merged-cell" rowspan="2"></td>
        <td class="col-name merged-cell" rowspan="2">侧板</td>
        <td>524</td>
        <td>12</td>
        <td class="col-remark merged-cell" rowspan="2" style="background-color: #ffff00;">45度切</td>
      </tr>
      <!-- H-1077 侧板 第二行 -->
      <tr class="data-row">
        <td>882</td>
        <td>12</td>
      </tr>

      <!-- 门板（红色文字行） -->
      <tr class="data-row red-row">
        <td></td>
        <td class="text-red">门板</td>
        <td class="text-red">473.9</td>
        <td class="text-red">855.2</td>
        <td>9</td>
        <td></td>
      </tr>

      <!-- 侧门板（红色文字行） -->
      <tr class="data-row red-row">
        <td></td>
        <td class="text-red">侧门板</td>
        <td class="text-red">521.2</td>
        <td class="text-red">879.2</td>
        <td>6</td>
        <td></td>
      </tr>

      <!-- 配件表 -->
      <tr>
        <td colspan="6" class="footer-title">配件表</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>

</style>
