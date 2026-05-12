<template>
  <div class="button-row">
    <el-button v-if="orderId" type="info" @click="goBackToOrders">返回订单管理</el-button>
    <el-button type="primary" @click="handleDownload">下载表格</el-button>
    <el-button type="success" @click="handleSave">保存表格数据</el-button>
    <el-button type="warning" @click="handlePrint">打印表格</el-button>
    <el-button type="danger" @click="handleClear">清空表格</el-button>
  </div>
  <div class="page-wrapper">
    <!-- 左侧固定参考表格（仅展示，无任何逻辑） -->
    <table class="reference-table reference-orange" border="1" cellspacing="0" cellpadding="0">
      <tr>
        <th></th>
        <th>名称</th>
        <th colspan="2">规格</th>
        <th>数量</th>
      </tr>
      <tr>
        <td rowspan="2"></td>
        <td rowspan="2">上包边</td>
        <td colspan="2">长度-84</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td colspan="2">宽度-84</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td rowspan="2"></td>
        <td rowspan="2">下包边</td>
        <td colspan="2">长度-84</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td colspan="2">宽度-84</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td></td>
        <td>立柱</td>
        <td colspan="2">高度-3</td>
        <td class="hl">固定值：4</td>
      </tr>
      <tr>
        <td></td>
        <td>前后横梁</td>
        <td colspan="2">长度-80</td>
        <td class="hl">固定值：4</td>
      </tr>
      <tr>
        <td></td>
        <td>侧横梁</td>
        <td colspan="2">宽度-140</td>
        <td class="hl">固定值：4</td>
      </tr>
      <tr>
        <td></td>
        <td>加固</td>
        <td colspan="2">高度-90</td>
        <td>自定义</td>
      </tr>
      <tr>
        <td></td>
        <td>拉筋</td>
        <td colspan="2">宽度-124</td>
        <td>门板数量*2</td>
      </tr>
      <tr>
        <td></td>
        <td>横拉</td>
        <td colspan="2">宽度-140</td>
        <td class="hl">固定值：1</td>
      </tr>
      <tr>
        <td rowspan="2"></td>
        <td rowspan="2">门料</td>
        <td colspan="2">（长度-80-（门板数量+1）*2）/门板数量</td>
        <td>门板数量*2</td>
      </tr>
      <tr>
        <td colspan="2">高度-25</td>
        <td>门板数量*2</td>
      </tr>
      <tr>
        <td rowspan="2"></td>
        <td rowspan="2">侧板</td>
        <td colspan="2">宽度-85</td>
        <td class="hl">固定值：4</td>
      </tr>
      <tr>
        <td colspan="2">高度-1</td>
        <td class="hl">固定值：4</td>
      </tr>
      <tr>
        <td rowspan="2"></td>
        <td rowspan="2">侧门料</td>
        <td colspan="2">长度-82</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td colspan="2">高度-1</td>
        <td class="hl">固定值：2</td>
      </tr>
      <tr>
        <td>门板</td>
        <td>门料第一个规格值-2.8</td>
        <td>高度-25-2.8</td>
        <td class="hl" colspan="2">门板数量*2</td>
      </tr>
      <tr>
        <td>侧门板</td>
        <td>宽度-85-2.8</td>
        <td>高度-1-2.8</td>
        <td class="hl" colspan="2">固定值：2</td>
      </tr>
      <tr>
        <td>背板</td>
        <td>长度-82-2.8</td>
        <td>高度-1-2.8</td>
        <td class="hl" colspan="2">固定值：1</td>
      </tr>
      <tr>
        <td>底板</td>
        <td>（长度-82）/门板数量</td>
        <td>宽度-126</td>
        <td colspan="2">门板数量</td>
      </tr>
    </table>

    <!-- 左侧页面标识标签条 -->
    <div class="page-label-bar" style="background: #e6a23c;">背板全平</div>
    <div class="table-container">
      <!-- 标题 -->
      <div class="table-title">天枢款-圆弧-背板全平</div>
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
import { useChangyongBiaoge } from '@/ts/天枢款/天枢款-背板全平/天枢款-背板全平'
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
  loadImageModules,
  bumpTableDataVersion,
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

// 可选的"增加类型"列表
const extraTypeOptions = [
  { label: '侧面加固', value: '侧面加固' },
  { label: '需要配件', value: '需要配件' },
] as const

// 当前选中要增加的类型
const extraTypeList = ref<string[]>([])

// 需要配件：所有配件名称
const PEIJIAN_NAMES = ['三卡锁', '堵头(分左右)', '角码', '反弹器', '大弯铰链', '直臂铰链', '铰链垫块']

/**
 * 根据 filteredTableData 和 doorCount 重新计算所有配件数量（需要配件模式）
 */
function recalcPeijianJiamen() {
  const rows = filteredTableData.value
  const doorCount = Number(info.doorCount) || 0

  const getShu = (mingcheng: string, idx = 0): number => {
    const matched = rows.filter((r: any) => r.mingcheng === mingcheng)
    return Number(matched[idx]?.shuliang) || 0
  }

  const qianHouHengLiang = getShu('前后横梁')
  const ceHengLiang = getShu('侧横梁')
  const zhongZhu = getShu('中柱')
  const laJin = getShu('拉筋')
  const hengLa = getShu('横拉')
  const liZhu = getShu('立柱')
  const menLiao0 = getShu('门料', 0)
  const menLiao1 = getShu('门料', 1)
  const ceBan0 = getShu('侧板', 0)
  const ceBan1 = getShu('侧板', 1)
  const ceMenLiao0 = getShu('侧门料', 0)
  const ceMenLiao1 = getShu('侧门料', 1)
  const jiaGu = getShu('加固')

  // 三卡锁 = (前后横梁 + 侧横梁 + 中柱 + 拉筋 + 横拉 + 加固) * 2
  const sanKaSuo = (qianHouHengLiang + ceHengLiang + zhongZhu + laJin + hengLa + jiaGu) * 2
  const duTou = liZhu * 2
  const jiaoMa = menLiao0 + menLiao1 + ceBan0 + ceBan1 + ceMenLiao0 + ceMenLiao1

  // 配件模式：直臂 = (doorCount-2)*2，大弯 = doorCount*2 - 直臂
  const zhiBiJiaoLian = doorCount > 2 ? (doorCount - 2) * 2 : 0
  const daWanJiaoLian = doorCount * 2 - zhiBiJiaoLian
  const fanTanQi = doorCount
  const jiaoLianDianKuai = doorCount * 2

  const valMap: Record<string, number> = {
    '三卡锁': sanKaSuo,
    '堵头(分左右)': duTou,
    '角码': jiaoMa,
    '反弹器': fanTanQi,
    '大弯铰链': daWanJiaoLian,
    '直臂铰链': zhiBiJiaoLian,
    '铰链垫块': jiaoLianDianKuai,
  }

  for (const item of allAccessories) {
    if (PEIJIAN_NAMES.includes(item.name)) {
      item.value = String(valMap[item.name] ?? 0)
    }
  }
}

// 勾选/取消增加类型：侧面加固 + 需要配件
watch(extraTypeList, (val) => {
  // ===== 1. 侧面加固：主表格"中柱"后插入"加固" =====
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

  // ===== 2. 需要配件 =====
  const hasJiaMen = val.includes('需要配件')

  if (hasJiaMen) {
    // 添加还不在 allAccessories 里的配件项
    for (const name of PEIJIAN_NAMES) {
      if (!allAccessories.find((a) => a.name === name)) {
        allAccessories.push({ name, value: '' })
      }
    }
    // 立即计算一次
    recalcPeijianJiamen()
  } else {
    // 未勾选，移除所有配件项
    for (let i = allAccessories.length - 1; i >= 0; i--) {
      if (PEIJIAN_NAMES.includes(allAccessories[i]?.name ?? '')) {
        allAccessories.splice(i, 1)
      }
    }
  }
})

// 监听相关数值变化，实时重算配件数量
watch(
  () => [filteredTableData.value, info.doorCount],
  () => {
    if (extraTypeList.value.includes('需要配件')) {
      recalcPeijianJiamen()
    }
  },
  { deep: true },
)

// 页面唯一标识，用于本地存储
const PAGE_KEY = '天枢款-背板全平'

// 保存表格数据点击事件
const handleSave = () => {
  saveTableData(PAGE_KEY, info, filteredTableData.value, filteredDoorPanelRows.value, allAccessories)
}

// 下载表格点击事件
const handleDownload = async () => {
  // 仅在点击时才加载图片，不进首屏 bundle
  const imageModules = await loadImageModules()
  await downloadTable(
    '天枢款-圆弧-背板全平',
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
      extraTypeList.value = [] // 同步清空"增加类型"
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

  // 加载历史数据后，根据保存数据自动勾选"侧面加固"以保持 UI 一致
  await restoreExtraTypeCheckboxes()
})

// 从持久化数据中恢复 extraTypeList 勾选状态
async function restoreExtraTypeCheckboxes() {
  // 1. 优先检测当前 tableData（适用于从订单管理加载场景）
  const restored: string[] = []
  if ((tableData as any[]).some((r) => r.mingcheng === '加固')) restored.push('侧面加固')
  // 若当前 allAccessories 中含有需要配件（例如从订单管理加载带过来的），也自动勾选
  if (
    allAccessories.some((a) => PEIJIAN_NAMES.includes(a?.name ?? '')) &&
    !restored.includes('需要配件')
  ) {
    restored.push('需要配件')
  }

  // 2. 兜底从 localStorage 检测（适用于本地缓存场景，因 button2.load 不会新增行）
  try {
    const saved = localStorage.getItem(`table_save_${PAGE_KEY}`)
    if (saved) {
      const data = JSON.parse(saved)
      const rows: Array<{ mingcheng?: string }> = data?.tableRows || []
      if (rows.some((r) => r?.mingcheng === '加固') && !restored.includes('侧面加固')) {
        restored.push('侧面加固')
      }
      // 检测保存的配件中是否含有"需要配件"相关的配件项
      const accRows: Array<{ name?: string }> = data?.accessoryRows || []
      if (
        accRows.some((a) => PEIJIAN_NAMES.includes(a?.name ?? '')) &&
        !restored.includes('需要配件')
      ) {
        restored.push('需要配件')
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
