<template>
  <div class="button-row">
    <el-button type="primary" @click="handleDownload">下载表格</el-button>
    <el-button type="success" @click="handleSave">保存表格数据</el-button>
    <el-button type="warning" @click="handlePrint">打印表格</el-button>
    <el-button type="danger" @click="handleClear">清空表格</el-button>
  </div>
  <div class="page-wrapper" ref="pageWrapperRef">
    <div class="table-container" ref="tableContainerRef">
      <!-- 标题 -->
      <div class="table-title">天枢款-圆弧</div>
      <!-- 基本信息区 -->
      <table
        class="info-table"
        border="1"
        cellspacing="0"
        cellpadding="0"
        style="text-align: center"
      >
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
            <el-select
              v-model="value3"
              placeholder="请选择"
              class="info-select"
              style="width: 130px"
            >
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
            <img
              v-if="row.tupian"
              :src="getImage(row.tupian)"
              :alt="row.tupian"
              class="table-img"
            />
          </template>
        </el-table-column>
        <el-table-column prop="mingcheng" label="名称" width="99" />
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
        <el-table-column prop="beizhu" label="备注">
          <template #default="{ row }">
            <span
              v-if="
                row.mingcheng === '上包边' ||
                row.mingcheng === '下包边' ||
                row.mingcheng === '前后横梁' ||
                row.mingcheng === '侧横梁' ||
                row.mingcheng === '中柱' ||
                row.mingcheng === '拉筋' ||
                row.mingcheng === '横拉' ||
                row.mingcheng === '门料' ||
                row.mingcheng === '侧板'
              "
              >{{ row.beizhu }}</span
            >
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
        v-if="filteredDoorPanelRows.length > 0"
        class="door-panel-table"
        border="1"
        cellspacing="0"
        cellpadding="0"
      >
        <tr v-for="(row, index) in filteredDoorPanelRows" :key="index">
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
    <div class="side-zhong-count" :style="{ top: zhongCountTop + 'px' }">
      <span>中柱数量：</span>
      <el-input v-model="info.zhongCount" placeholder="中柱数量" class="info-zz-input" />
    </div>
    <div class="side-height-select" :style="{ top: heightSelectTop + 'px' }">
      <span>不生成的名称：</span>
      <el-select
        v-model="value1"
        multiple
        placeholder="请选择"
        class="side-select"
        style="width: 110px"
      >
        <el-option
          v-for="item in options1"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <span style="margin-left: 15px">不生成的底部门板：</span>
      <el-select
        v-model="value6"
        multiple
        placeholder="请选择"
        class="side-select"
        style="width: 90px"
      >
        <el-option
          v-for="item in options6"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useChangyongBiaoge } from '@/ts/自由选择-单面门-通配款/自由选择-单面门-通配款'
import { clearTable } from '@/ts/按钮/button4'
import { downloadTable } from '@/ts/按钮/button1'
import {
  saveTableData,
  loadTableData,
  loadOrderFromServer,
  setCurrentOrderId,
} from '@/ts/按钮/button2'
import { printTable } from '@/ts/按钮/button3'
import { watch, ref, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  value1,
  value3,
  value6,
  options1,
  options3,
  options6,
} from '@/ts/自由选择-单面门-通配款/xialakuang'
const {
  info,
  filteredTableData,
  mergeMethod,
  accessoryRows,
  doorPanelRows,
  filteredDoorPanelRows,
  getImage,
  saveToLocalStorage,
  tableData,
  allAccessories,
  imageModules,
} = useChangyongBiaoge(value1, value6)

// 页面唯一标识，用于本地存储
const PAGE_KEY = '天枢款'

// 保存表格数据点击事件
const handleSave = () => {
  saveTableData(PAGE_KEY, info, filteredTableData.value, doorPanelRows.value, allAccessories)
}

// 下载表格点击事件
const handleDownload = async () => {
  await downloadTable(
    '天枢款-圆弧',
    info,
    filteredTableData.value,
    doorPanelRows.value,
    allAccessories,
    imageModules,
  )
}

// 打印表格点击事件
const handlePrint = () => {
  printTable()
}

// 清空表格点击事件
const handleClear = () => {
  ElMessageBox.confirm('确定要清空表格中所有数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      clearTable(info, tableData, doorPanelRows.value, allAccessories)
      value3.value = '' // 同步清空表面下拉框
    })
    .catch(() => {})
}

const pageWrapperRef = ref<HTMLElement | null>(null)
const tableContainerRef = ref<HTMLElement | null>(null)
const doorCountTop = ref(0)
const zhongCountTop = ref(0)
const heightSelectTop = ref(0)

// 计算高度行位置，使下拉框与基本信息表格的高度行水平对齐
const calcHeightSelectTop = () => {
  nextTick(() => {
    const wrapper = pageWrapperRef.value
    const container = tableContainerRef.value
    if (!wrapper || !container) return
    // 查找基本信息表格中高度行（第3个 tr）
    const infoTable = container.querySelector('.info-table')
    if (!infoTable) return
    const rows = infoTable.querySelectorAll('tr')
    // 高度在第3行（index=2）
    if (rows.length >= 3) {
      const heightRow = rows[2]
      if (!heightRow) return
      const wrapperRect = wrapper.getBoundingClientRect()
      const rowRect = heightRow.getBoundingClientRect()
      heightSelectTop.value = rowRect.top - wrapperRect.top + (rowRect.height - 32) / 2
    }
  })
}

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

const currentRoute = useRoute()

onMounted(async () => {
  // 检查是否从订单管理页面跳转过来，带有 orderId 参数
  const orderId = currentRoute.query.orderId
  if (orderId) {
    const id = Number(orderId)
    const loaded = await loadOrderFromServer(
      id,
      info,
      tableData,
      doorPanelRows.value,
      allAccessories,
    )
    if (loaded && info.surface) {
      value3.value = info.surface
    }
  } else {
    // 没有 orderId，从本地存储加载之前保存的数据
    setCurrentOrderId(null)
    loadTableData(PAGE_KEY, info, tableData, doorPanelRows.value, allAccessories)
    if (info.surface) {
      value3.value = info.surface
    }
  }

  // el-table 内部渲染是异步的，延迟执行确保表格完全渲染
  setTimeout(() => {
    calcDoorCountTop()
    calcZhongCountTop()
    calcHeightSelectTop()
  }, 300)
})

// 监听表面下拉框变化，同步到 info.surface（供下载和保存使用）
watch(value3, (newVal) => {
  info.surface = newVal
})

// 监听数据变化，自动保存到本地存储
watch(
  () => [doorPanelRows.value, info.remark],
  () => {
    saveToLocalStorage()
  },
  { deep: true },
)
</script>

<style scoped src="@/css/天枢款.css"></style>
