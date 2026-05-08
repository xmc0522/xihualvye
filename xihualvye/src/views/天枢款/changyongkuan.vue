<template>
  <div class="button-row">
    <el-button v-if="orderId" type="info" @click="goBackToOrders">返回订单管理</el-button>
    <el-button type="primary" @click="handleDownload">下载表格</el-button>
    <el-button type="success" @click="handleSave">保存表格数据</el-button>
    <el-button type="warning" @click="handlePrint">打印表格</el-button>
    <el-button type="danger" @click="handleClear">清空表格</el-button>
  </div>
  <div class="page-wrapper">
    <!-- 左侧页面标识标签条 -->
    <div class="page-label-bar" style="background: #67c23a;">常用款</div>
    <div class="table-container">
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
            <el-date-picker
              v-model="info.date"
              type="date"
              placeholder="请选择日期"
              value-format="YYYY/MM/DD"
              class="info-input"
              style="width: 100%"
            />
          </td>
        </tr>
        <tr>
          <td class="label-cell">表面：</td>
          <td class="value-cell" style="width: 160px">
            <el-input
              v-model="value3"
              placeholder="请输入表面"
              class="info-input"
              style="width: 130px"
            />
          </td>
          <td class="label-cell" style="width: 99px">数量：</td>
          <td class="value-cell" style="width: 100px;padding-left: 0px;padding-right: 0px;">
            <el-input v-model="info.quantity" placeholder="请输入数量" class="info-input" style="width: 70px;"/><span class="print-unit">套</span> 
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
              loading="lazy"
            />
          </template>
        </el-table-column>
        <el-table-column prop="mingcheng" label="名称" width="99" />
        <el-table-column prop="guige" label="规格" width="100" class-name="guige-col" />
        <el-table-column prop="shuliang" label="数量" width="70" class-name="shuliang-col">
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
    <div class="side-door-count" style="top: 100px">
      <span>门板数量：</span>
      <el-input v-model="info.doorCount" placeholder="门板数量" class="info-meng-input" />
      <span style="margin-left: 20px">背板数量：</span>
      <el-input v-model="info.beibanCount" placeholder="背板数量" class="info-meng-input" />
    </div>
    <!-- 不生成类型 + 增加配件 下拉选择（并排定位到表格右侧顶部） -->
    <div class="side-height-select" style="top: 150px">
      <span>不生成类型：</span>
      <el-select
        v-model="excludeList"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="选择不生成的项"
        class="side-select exclude-select"
        style="width: 140px; margin-left: 4px"
      >
        <el-option
          v-for="opt in excludeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <span style="margin-left: 12px">增加配件：</span>
      <el-select
        v-model="extraAccessoryList"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="选择增加的配件"
        class="side-select exclude-select"
        style="width: 140px; margin-left: 4px"
      >
        <el-option
          v-for="opt in extraAccessoryOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <span style="margin-left: 12px">增加类型：</span>
      <el-select
        v-model="extraTypeList"
        multiple
        collapse-tags
        collapse-tags-tooltip
        placeholder="选择增加的类型"
        class="side-select exclude-select"
        style="width: 140px; margin-left: 4px"
      >
        <el-option
          v-for="opt in extraTypeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useChangyongBiaoge } from '@/ts/天枢款/天枢款-常用款/天枢款-常用款'
import { clearTable } from '@/ts/按钮/button4'
import { downloadTable } from '@/ts/按钮/button1'
import {
  saveTableData,
  loadTableData,
  loadOrderFromServer,
  setCurrentOrderId,
} from '@/ts/按钮/button2'
import { printTable } from '@/ts/按钮/button3'
import { watch, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { value3 } from '@/ts/xialakuang'
const {
  info,
  filteredTableData,
  mergeMethod,
  accessoryRows,
  doorPanelRows,
  filteredDoorPanelRows,
  excludeNames,
  excludeDoorPanels,
  getImage,
  saveToLocalStorage,
  tableData,
  allAccessories,
  imageModules,
  recalcExtraAccessories,
  bumpTableDataVersion,
  isBeibanOneMode,
} = useChangyongBiaoge()

// 不生成选项（统一下拉框）。type 用于区分归属主表格还是底部门板
const excludeOptions = [
  { label: '不生成上包边', value: '上包边', type: 'main' },
  { label: '不生成横拉', value: '横拉', type: 'main' },
  { label: '不生成门料', value: '门料', type: 'main' },
  { label: '不生成侧板', value: '侧板', type: 'main' },
  { label: '不生成门板', value: '门板', type: 'door' },
  { label: '不生成侧门板', value: '侧门板', type: 'door' },
] as const

// 统一绑定的下拉值，双向同步到 excludeNames 和 excludeDoorPanels
const excludeList = ref<string[]>([])
watch(excludeList, (val) => {
  const mains: string[] = []
  const doors: string[] = []
  for (const v of val) {
    const opt = excludeOptions.find((o) => o.value === v)
    if (!opt) continue
    if (opt.type === 'main') mains.push(v)
    else doors.push(v)
  }
  excludeNames.value = mains
  excludeDoorPanels.value = doors
})

// 可选的额外配件列表
const extraAccessoryOptions = [
  { label: '三卡锁', value: '三卡锁' },
  { label: '堵头(分左右)', value: '堵头(分左右)' },
  { label: '角码', value: '角码' },
  { label: '反弹器', value: '反弹器' },
  { label: '大弯铰链', value: '大弯铰链' },
  { label: '直臂铰链', value: '直臂铰链' },
  { label: '铰链垫块', value: '铰链垫块' },
] as const

// 当前选中要增加的配件
const extraAccessoryList = ref<string[]>([])

// 可选的"增加类型"列表（暂不处理联动逻辑，仅页面展示）
const extraTypeOptions = [
  { label: '背板多块', value: '背板多块' },
  { label: '侧面加固', value: '侧面加固' },
  { label: '背板一块', value: '背板一块' },
] as const

// 当前选中要增加的类型
const extraTypeList = ref<string[]>([])

// 同步 extraAccessoryList 到 allAccessories：勾选时添加，取消时移除
watch(extraAccessoryList, (val) => {
  // 移除已不在选中列表中的额外配件（只操作 extra 范围内的名称）
  const extraNames = extraAccessoryOptions.map((o) => o.value)
  for (let i = allAccessories.length - 1; i >= 0; i--) {
    const item = allAccessories[i]
    if (item && extraNames.includes(item.name as any) && !val.includes(item.name)) {
      allAccessories.splice(i, 1)
    }
  }
  // 新增还不在 allAccessories 里的配件
  for (const name of val) {
    if (!allAccessories.find((a) => a.name === name)) {
      allAccessories.push({ name, value: '' })
    }
  }
  // 新增/移除后立即计算一次额外配件的数量（三卡锁/堵头/角码）
  recalcExtraAccessories()
})

// ============ "背板多块" 联动 ============

/**
 * 按"门板数量"公式计算背板三个值并写入 doorPanelRows 中的背板行
 * shuju1 = (长度 - 80 - (门数量 - 1) * 38) / 门数量 + 5
 * shuju2 = 高度 - 85.5
 * shuliang = 门数量
 */
function recalcBackPanelByDoorCount() {
  const beiBan = doorPanelRows.value.find((r) => r.name === '背板')
  if (!beiBan) return
  const doorCount = Number(info.doorCount) || 0
  if (info.length && doorCount > 0) {
    beiBan.shuju1 = String((Number(info.length) - 80 - (doorCount - 1) * 38) / doorCount + 5)
  } else {
    beiBan.shuju1 = ''
  }
  beiBan.shuju2 = info.height ? String(Number(info.height) - 85.5) : ''
  beiBan.shuliang = doorCount > 0 ? String(doorCount) : ''
}

// 勾选/取消增加类型：背板多块 / 侧面加固 / 背板一块
watch(extraTypeList, (val) => {
  // ===== 1. 背板多块：底部门板"侧门板"后插入"背板" =====
  const hasBackPanel = val.includes('背板多块')
  const backIdx = doorPanelRows.value.findIndex((r) => r.name === '背板')

  if (hasBackPanel && backIdx === -1) {
    const sideIdx = doorPanelRows.value.findIndex((r) => r.name === '侧门板')
    const insertAt = sideIdx >= 0 ? sideIdx + 1 : doorPanelRows.value.length
    doorPanelRows.value.splice(insertAt, 0, {
      name: '背板',
      shuju1: '',
      shuju2: '',
      shuliang: '',
      beizhu: '',
    })
    recalcBackPanelByDoorCount()
  } else if (!hasBackPanel && backIdx >= 0) {
    doorPanelRows.value.splice(backIdx, 1)
  }

  // ===== 2. 侧面加固：主表格"中柱"后插入"加固" =====
  const hasReinforce = val.includes('侧面加固')
  const reinforceIdx = tableData.findIndex((r: any) => r.mingcheng === '加固')

  if (hasReinforce && reinforceIdx === -1) {
    const zhongIdx = tableData.findIndex((r: any) => r.mingcheng === '中柱')
    const insertAt = zhongIdx >= 0 ? zhongIdx + 1 : tableData.length
    tableData.splice(insertAt, 0, {
      xinghao: 'H-1005',
      tupian: 'H-1005',
      mingcheng: '加固',
      guige: '',
      shuliang: '',
      beizhu: '冲孔',
      _mergeXinghao: 1,
      _mergeTupian: 1,
      _mergeMingcheng: 1,
      _mergeShuliang: 1,
    } as any)
    bumpTableDataVersion()
  } else if (!hasReinforce && reinforceIdx >= 0) {
    tableData.splice(reinforceIdx, 1)
    bumpTableDataVersion()
  }

  // ===== 3. 背板一块：底部门板"侧门板"后插入"背板"，主表格"中柱"后插入"小中柱" =====
  const hasBeibanOne = val.includes('背板一块')

  // 3a. 切换 isBeibanOneMode（触发 filteredTableData 重算中柱公式）
  isBeibanOneMode.value = hasBeibanOne

  // 3b. 底部门板里的"背板"行
  const backOneIdx = doorPanelRows.value.findIndex((r) => r.name === '背板')
  if (hasBeibanOne && backOneIdx === -1) {
    const sideIdx = doorPanelRows.value.findIndex((r) => r.name === '侧门板')
    const insertAt = sideIdx >= 0 ? sideIdx + 1 : doorPanelRows.value.length
    doorPanelRows.value.splice(insertAt, 0, {
      name: '背板',
      shuju1: '',
      shuju2: '',
      shuliang: '',
      beizhu: '',
    })
    recalcBeibanOne()
  } else if (!hasBeibanOne && backOneIdx >= 0 && !hasBackPanel) {
    // 只在"背板多块"也没勾的时候才移除（避免两个模式冲突）
    doorPanelRows.value.splice(backOneIdx, 1)
  }

  // 3c. 主表格里的"小中柱"行
  const xiaoZhongIdx = tableData.findIndex((r: any) => r.mingcheng === '小中柱')
  if (hasBeibanOne && xiaoZhongIdx === -1) {
    const zhongIdx = tableData.findIndex((r: any) => r.mingcheng === '中柱')
    const insertAt = zhongIdx >= 0 ? zhongIdx + 1 : tableData.length
    tableData.splice(insertAt, 0, {
      xinghao: 'H-1005',
      tupian: 'H-1005',
      mingcheng: '小中柱',
      guige: '',
      shuliang: '',
      beizhu: '冲孔',
      _mergeXinghao: 1,
      _mergeTupian: 1,
      _mergeMingcheng: 1,
      _mergeShuliang: 1,
    } as any)
    bumpTableDataVersion()
  } else if (!hasBeibanOne && xiaoZhongIdx >= 0) {
    tableData.splice(xiaoZhongIdx, 1)
    bumpTableDataVersion()
  }
})

// 背板一块：背板底部门板的值计算
// shuju1 = 长度 - 80 + 5，shuju2 = 高度 - 85.5，shuliang = 背板数量
function recalcBeibanOne() {
  const beiBan = doorPanelRows.value.find((r) => r.name === '背板')
  if (!beiBan) return
  beiBan.shuju1 = info.length ? String(Number(info.length) - 80 + 5) : ''
  beiBan.shuju2 = info.height ? String(Number(info.height) - 85.5) : ''
  beiBan.shuliang = info.beibanCount || ''
}

// 监听尺寸/背板数量变化，实时同步相关计算
watch(
  () => [info.length, info.height, info.doorCount, info.beibanCount],
  () => {
    if (extraTypeList.value.includes('背板多块')) {
      recalcBackPanelByDoorCount()
    }
    if (extraTypeList.value.includes('背板一块')) {
      recalcBeibanOne()
      // 背板一块模式下，触发 filteredTableData 重算（中柱/小中柱数量依赖门板数量和背板数量）
      bumpTableDataVersion()
    }
  },
)

// 页面唯一标识，用于本地存储
const PAGE_KEY = '天枢款-常用款'

// 保存表格数据点击事件
const handleSave = () => {
  saveTableData(PAGE_KEY, info, filteredTableData.value, filteredDoorPanelRows.value, allAccessories)
}

// 下载表格点击事件
const handleDownload = async () => {
  await downloadTable(
    '天枢款-圆弧',
    info,
    filteredTableData.value,
    filteredDoorPanelRows.value,
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
      clearTable(info, tableData, doorPanelRows.value, allAccessories, PAGE_KEY)
      value3.value = '' // 同步清空表面下拉框
      extraTypeList.value = [] // 同步清空"增加类型"，移除背板多块等
      extraAccessoryList.value = [] // 同步清空"额外配件"
    })
    .catch(() => {})
}

const currentRoute = useRoute()
const router = useRouter()
const orderId = ref<number | null>(null)

// 返回订单管理页面
const goBackToOrders = () => {
  router.push({ path: '/orders', query: { highlightId: String(orderId.value) } })
}

onMounted(async () => {
  const orderIdParam = currentRoute.query.orderId
  if (orderIdParam) {
    orderId.value = Number(orderIdParam)
    const id = Number(orderIdParam)
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
    setCurrentOrderId(null)
    loadTableData(PAGE_KEY, info, tableData, doorPanelRows.value, allAccessories)
    if (info.surface) {
      value3.value = info.surface
    }
  }

  // 加载历史数据后，根据保存数据自动勾选"背板多块"/"侧面加固"以保持 UI 一致
  await restoreExtraTypeCheckboxes()
})

// 从持久化数据中恢复 extraTypeList 勾选状态
async function restoreExtraTypeCheckboxes() {
  // 1. 优先检测当前 doorPanelRows / tableData（适用于从订单管理加载场景）
  const restored: string[] = []
  if (doorPanelRows.value.some((p) => p.name === '背板')) restored.push('背板多块')
  if ((tableData as any[]).some((r) => r.mingcheng === '加固')) restored.push('侧面加固')
  if ((tableData as any[]).some((r) => r.mingcheng === '小中柱')) restored.push('背板一块')

  // 2. 兜底从 localStorage 检测（适用于本地缓存场景，因 button2.load 不会新增行）
  try {
    const saved = localStorage.getItem(`table_save_${PAGE_KEY}`)
    if (saved) {
      const data = JSON.parse(saved)
      const panels: Array<{ name?: string }> = data?.doorPanels || []
      const rows: Array<{ mingcheng?: string }> = data?.tableRows || []
      if (panels.some((p) => p?.name === '背板') && !restored.includes('背板多块')) {
        restored.push('背板多块')
      }
      if (rows.some((r) => r?.mingcheng === '加固') && !restored.includes('侧面加固')) {
        restored.push('侧面加固')
      }
      if (rows.some((r) => r?.mingcheng === '小中柱') && !restored.includes('背板一块')) {
        restored.push('背板一块')
      }
    }
  } catch {
    // 忽略恢复失败
  }

  if (restored.length > 0) {
    extraTypeList.value = Array.from(new Set([...extraTypeList.value, ...restored]))
  }
}

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
