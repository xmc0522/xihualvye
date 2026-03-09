<template>
<div class="page-wrapper" ref="pageWrapperRef">
  <div class="table-container" ref="tableContainerRef">    <!-- 标题 -->
    <div class="table-title">天枢款-圆弧</div>
    <!-- 基本信息区 -->
    <table class="info-table" border="1" cellspacing="0" cellpadding="0" style="text-align: center">
      <tr>
        <td class="label-cell">客户：</td>
        <td class="value-cell" colspan="2">
          <el-input v-model="info.customer" placeholder="请输入客户" class="info-input" />
        </td>
        <td class="label-cell">日期：</td>
        <td class="value-cell" colspan="2">
          <el-input v-model="info.date" placeholder="日期格式：xxxx/xx/xx" class="info-input" />
        </td>
      </tr>
      <tr>
        <td class="label-cell">表面：</td>
        <td class="value-cell" style="width: 160px">
          <el-select v-model="value3" placeholder="请选择" class="info-select" style="width: 130px">
            <el-option
              v-for="item in options3"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </td>
        <td class="label-cell" style="width: 99px">数量：</td>
        <td class="value-cell" style="width: 100px">
          <el-input v-model="info.quantity" placeholder="请输入数量" class="info-input" />
        </td>
        <td class="label-cell" style="padding: 0; width: 70px">客户单号：</td>
        <td class="value-cell">
          <el-input v-model="info.orderNo" placeholder="请输入单号" class="info-input" />
        </td>
      </tr>
      <tr>
        <td class="label-cell">长度：</td>
        <td class="value-cell" style="width: 160px">
          <el-input v-model="info.length" placeholder="请输入长度" class="info-input" />
        </td>
        <td class="label-cell" style="width: 99px">宽度：</td>
        <td class="value-cell" style="width: 99px">
          <el-input v-model="info.width" placeholder="请输入宽度" class="info-input" />
        </td>
        <td class="label-cell" style="padding: 0; width: 70px">高度：</td>
        <td class="value-cell">
          <el-input v-model="info.height" placeholder="请输入高度" class="info-input" />
        </td>
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
          <span v-if="row.mingcheng === '上包边' || row.mingcheng === '下包边' || row.mingcheng === '前后横梁' || row.mingcheng === '侧横梁' || row.mingcheng === '中柱' || row.mingcheng === '拉筋' || row.mingcheng === '横拉' || row.mingcheng === '门料' || row.mingcheng === '侧板'">{{ row.beizhu }}</span>
          <el-input
            v-else
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
  <div class="side-door-count" :style="{ top: doorCountTop + 'px' }">
    <span>门数量：</span>
    <el-input v-model="info.doorCount" placeholder="门数量" class="info-meng-input" />
  </div>
  <!-- <div class="side-zhong-count" :style="{ top: zhongCountTop + 'px' }">
    <span>中柱数量：</span>
    <el-input v-model="info.zhongCount" placeholder="中柱数量" class="info-zz-input" />
  </div> -->
</div>
</template>

<script lang="ts" setup>
import { useChangyongBiaoge } from '@/ts/天枢款-双面门-背面假门/天枢款-双面门-背面假门'
import { watch, ref, onMounted, nextTick } from 'vue'
// import { size, value2 } from '@/ts/date-picker'
import { value1,value3, value4,value5,options1, options3, options4,options5} from '@/ts/xialakuang'
const { info, filteredTableData, mergeMethod, accessoryRows, doorPanelRows, getImage, saveToLocalStorage } =
  useChangyongBiaoge()

const pageWrapperRef = ref<HTMLElement | null>(null)
const tableContainerRef = ref<HTMLElement | null>(null)
const doorCountTop = ref(0)
const zhongCountTop = ref(0)

// 计算拉筋行位置，使门数量输入框与拉筋行水平对齐
const calcDoorCountTop = () => {
  nextTick(() => {
    const wrapper = pageWrapperRef.value
    const container = tableContainerRef.value
    if (!wrapper || !container) return
    // 查找主表格中拉筋行
    const rows = container.querySelectorAll('.main-table .el-table__body tbody tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      for (const cell of cells) {
        if (cell.textContent?.trim() === '拉筋') {
          const wrapperRect = wrapper.getBoundingClientRect()
          const rowRect = row.getBoundingClientRect()
          doorCountTop.value = rowRect.top - wrapperRect.top + (rowRect.height - 32) / 2
          return
        }
      }
    }
  })
}

// 计算背板行位置，使中柱数量输入框与背板行水平对齐
const calcZhongCountTop = () => {
  nextTick(() => {
    const wrapper = pageWrapperRef.value
    const container = tableContainerRef.value
    if (!wrapper || !container) return
    // 查找底部门板表格中背板行
    const doorPanelTable = container.querySelector('.door-panel-table')
    if (!doorPanelTable) return
    const rows = doorPanelTable.querySelectorAll('tr')
    for (const row of rows) {
      const cells = row.querySelectorAll('td')
      for (const cell of cells) {
        if (cell.textContent?.trim() === '背板') {
          const wrapperRect = wrapper.getBoundingClientRect()
          const rowRect = row.getBoundingClientRect()
          zhongCountTop.value = rowRect.top - wrapperRect.top + (rowRect.height - 32) / 2
          return
        }
      }
    }
  })
}

onMounted(() => {
  // el-table 内部渲染是异步的，延迟执行确保表格完全渲染
  setTimeout(() => {
    calcDoorCountTop()
    calcZhongCountTop()
  }, 300)
})

// 监听表格数据变化，重新计算门数量和中柱数量的位置
watch(
  () => [filteredTableData.value, doorPanelRows.value],
  () => {
    // 延迟执行，等待 DOM 更新完成
    setTimeout(() => {
      calcDoorCountTop()
      calcZhongCountTop()
    }, 100)
  },
  { deep: true }
)

// 监听数据变化，自动保存到本地存储
watch(
  () => [doorPanelRows.value, info.remark],
  () => {
    saveToLocalStorage()
  },
  { deep: true }
)
</script>

<style scoped src="@/css/天枢款.css"></style>