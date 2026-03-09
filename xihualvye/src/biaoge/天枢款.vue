<template>
  <div class="table-container">
    <!-- 标题 -->
    <div class="table-title">天枢款-圆弧</div>

    <!-- 基本信息区 -->
    <table class="info-table" border="1" cellspacing="0" cellpadding="0" style="text-align: center">
      <tr>
        <td class="label-cell">客户：</td>
        <td class="value-cell" colspan="2">{{ info.customer }}</td>
        <td class="label-cell">日期：</td>
        <td class="value-cell" colspan="2">{{ info.date }}</td>
      </tr>
      <tr>
        <td class="label-cell">表面：</td>
        <td class="value-cell" style="width: 160px">{{ info.surface }}</td>
        <td class="label-cell" style="width: 99px">数量：</td>
        <td class="value-cell" style="width: 100px">{{ info.quantity }}</td>
        <td class="label-cell" style="padding: 0; width: 70px">客户单号：</td>
        <td class="value-cell">{{ info.orderNo }}</td>
      </tr>
      <tr>
        <td class="label-cell">长度：</td>
        <td class="value-cell" style="width: 160px">{{ info.length }}</td>
        <td class="label-cell" style="width: 99px">宽度：</td>
        <td class="value-cell" style="width: 99px">{{ info.width }}</td>
        <td class="label-cell" style="padding: 0; width: 70px">高度：</td>
        <td class="value-cell">{{ info.height }}</td>
      </tr>
    </table>

    <!-- 主数据表格 -->
    <el-table
      :data="filteredTableData"
      border
      style="width: 100%"
      :span-method="mergeMethod"
      class="main-table"
      :header-cell-style="{
        background: '#fff',
        color: '#000',
        textAlign: 'center',
        fontWeight: 'normal',
      }"
      :cell-style="{ textAlign: 'center' }"
    >
      <el-table-column prop="xinghao" label="型号" width="90" />
      <el-table-column prop="tupian" label="图片" width="160">
        <template #default="{ row }">
          <img v-if="row.tupian" :src="getImage(row.tupian)" :alt="row.tupian" class="table-img" />
        </template>
      </el-table-column>
      <el-table-column prop="mingcheng" label="名称" width="100" />
      <el-table-column prop="guige" label="规格" width="100" />
      <el-table-column prop="shuliang" label="数量" width="70">
        <template #default="{ row }">
          <el-input
            v-model="row.shuliang"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 2 }"
            class="shuliang-input"
            resize="none"
          />
        </template>
      </el-table-column>
      <el-table-column prop="beizhu" label="备注" width="179.5">
        <template #default="{ row }">
          <el-input
            v-model="row.beizhu"
            type="textarea"
            :rows="1"
            resize="none"
            class="beizhu-input"
            placeholder="请输入备注"
          />
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部门板 -->
    <table
      v-if="doorPanelRows.length > 0"
      class="door-panel-table"
      border="1"
      cellspacing="0"
      cellpadding="0"
    >
      <tr v-for="(row, index) in doorPanelRows" :key="index">
        <td class="value-cell" style="width: 250px">{{ row.name }}</td>
        <td class="value-cell" style="width: 99px">{{ row.shuju1 }}</td>
        <td class="value-cell" style="width: 100px">{{ row.shuju2 }}</td>
        <td class="value-cell" style="width: 70px; text-align: center">
          <el-input
            v-model="row.shuliang"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 2 }"
            class="shuliang-input"
            resize="none"
          />
        </td>
        <td class="value-cell beizhu-input">
          <el-input
            v-model="row.beizhu"
            type="textarea"
            :rows="1"
            resize="none"
            placeholder="请输入备注"
          />
        </td>
      </tr>
    </table>

    <!-- 配件表 -->
    <table
      v-if="accessoryRows.length > 0"
      class="accessory-table"
      border="1"
      cellspacing="0"
      cellpadding="0"
    >
      <tr>
        <td colspan="6" class="section-title">配件表</td>
      </tr>
      <tr v-for="(row, index) in accessoryRows" :key="index">
        <td class="acc-label">{{ row.name1 }}</td>
        <td class="acc-value">{{ row.value1 }}</td>
        <template v-if="row.name2">
          <td class="acc-label">{{ row.name2 }}</td>
          <td class="acc-value">{{ row.value2 }}</td>
        </template>
        <template v-else>
          <td colspan="2"></td>
        </template>
        <template v-if="row.name3">
          <td class="acc-label">{{ row.name3 }}</td>
          <td class="acc-value">{{ row.value3 }}</td>
        </template>
        <template v-else>
          <td colspan="2"></td>
        </template>
      </tr>
    </table>

    <!-- 工艺备注 -->
    <table class="remark-table" border="1" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="6" class="section-title">工艺备注</td>
      </tr>
      <tr>
        <td colspan="6" class="remark-content">
          <el-input
            v-model="info.remark"
            type="textarea"
            :rows="2"
            placeholder="请输入工艺备注"
            class="remark-input"
            resize="none"
          />
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { useChangyongBiaoge } from '../ts/天枢款-单门-加背板/天枢款-单门-加背板'
import { watch } from 'vue'

const { info, filteredTableData, mergeMethod, accessoryRows, doorPanelRows, getImage, saveToLocalStorage } =
  useChangyongBiaoge()

// 监听数据变化，自动保存到本地存储
watch(
  () => [doorPanelRows.value, info.remark],
  () => {
    saveToLocalStorage()
  },
  { deep: true }
)
</script>

<style scoped src="../css/天枢款.css"></style>
