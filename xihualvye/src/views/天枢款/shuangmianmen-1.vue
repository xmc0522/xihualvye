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
    <table class="reference-table reference-blue" border="1" cellspacing="0" cellpadding="0">
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
        <td>门板数量*2*2</td>
      </tr>
      <tr>
        <td colspan="2">高度-25</td>
        <td>门板数量*2*2</td>
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
        <td>门板</td>
        <td>门料第一个规格值-2.8</td>
        <td>高度-25-2.8</td>
        <td  colspan="2">门板数量*2</td>
      </tr>
      <tr>
        <td>侧门板</td>
        <td>宽度-85-2.8</td>
        <td>高度-1-2.8</td>
        <td class="hl" colspan="2">固定值：2</td>
      </tr>
      <tr>
        <td>底板</td>
        <td>（长度-82）/门板数量</td>
        <td>宽度-126</td>
        <td colspan="2">门板数量</td>
      </tr>
    </table>

    <!-- 左侧页面标识标签条 -->
    <div class="page-label-bar" style="background: #409eff;">双面门</div>
    <div class="table-container">
      <!-- 标题 -->
      <div class="table-title">天枢款-圆弧-双面门</div>
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
              v-model="info.surface"
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
            <!-- 第二个门料（被合并行）：备注可输入 -->
            <el-input
              v-if="row.mingcheng === '门料' && row._mergeShuliang === 0"
              v-model="row.beizhu"
              type="textarea"
              :rows="1"
              resize="none"
              class="beizhu-input"
              placeholder="请输入备注"
            />
            <span
              v-else-if="
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
    <!-- 不生成类型下拉 -->
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
import { useChangyongBiaoge } from '@/ts/天枢款/天枢款-双面门/天枢款-双面门'
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

// 不生成选项
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

// 增加类型选项
const extraTypeOptions = [
  { label: '侧面加固', value: '侧面加固' },
  { label: '需要配件', value: '需要配件' },
  { label: '假门-需要配件', value: '假门-需要配件' },
  { label: '需要底板', value: '需要底板' },
] as const

const extraTypeList = ref<string[]>([])

// 需要配件：所有配件名称（与 allAccessories 里注释的一致）
const PEIJIAN_NAMES = ['三卡锁', '堵头(分左右)', '角码', '反弹器', '大弯铰链', '直臂铰链', '铰链垫块']

/**
 * 根据 filteredTableData 和 doorCount 重新计算所有配件数量
 * mode: 'normal'（需要配件）| 'jiamen'（假门需要配件）
 *
 * 三类公式差异（其余相同）：
 *   铰链垫块：normal = doorCount*2*2，jiamen = doorCount*2
 *   反弹器：  normal = doorCount*2，  jiamen = doorCount
 *   大弯铰链：normal = doorCount*2*2 - 直臂铰链，jiamen = doorCount*2*2 - 直臂铰链（相同）
 */
function recalcPeijian(mode: 'normal' | 'jiamen' = 'normal') {
  const rows = filteredTableData.value
  const doorCount = Number(info.doorCount) || 0
  // 数量倍率：用于直接基于 doorCount 计算的配件（铰链类、反弹器）
  // 注意：三卡锁/堵头/角码 是从主表 shuliang 派生的，主表 shuliang 已乘 qty，故此处不再叠加
  const qty = Number(info.quantity) || 1

  const getShu = (mingcheng: string, idx = 0): number => {
    const matched = rows.filter((r) => r.mingcheng === mingcheng)
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
  const jiaGu = getShu('加固')

  // 三卡锁 = (前后横梁 + 侧横梁 + 中柱 + 拉筋 + 横拉 + 加固) * 2
  const sanKaSuo = (qianHouHengLiang + ceHengLiang + zhongZhu + laJin + hengLa + jiaGu) * 2
  const duTou = liZhu * 2
  const jiaoMa = menLiao0 + menLiao1 + ceBan0 + ceBan1

  // 直臂/大弯铰链：两种模式公式不同（均需乘 qty）
  // normal: 直臂 = (doorCount-2)*2*2*qty，大弯 = doorCount*2*2*qty - 直臂
  // jiamen: 直臂 = (doorCount-2)*2*qty，  大弯 = doorCount*2*qty   - 直臂
  let zhiBiJiaoLian: number
  let daWanJiaoLian: number
  if (mode === 'jiamen') {
    zhiBiJiaoLian = doorCount > 2 ? (doorCount - 2) * 2 * qty : 0
    daWanJiaoLian = doorCount * 2 * qty - zhiBiJiaoLian
  } else {
    zhiBiJiaoLian = doorCount > 2 ? (doorCount - 2) * 2 * 2 * qty : 0
    daWanJiaoLian = doorCount * 2 * 2 * qty - zhiBiJiaoLian
  }

  // 反弹器、铰链垫块两种模式有差异（均需乘 qty）
  const fanTanQi = mode === 'jiamen' ? doorCount * qty : doorCount * 2 * qty
  const jiaoLianDianKuai = mode === 'jiamen' ? doorCount * 2 * qty : doorCount * 2 * 2 * qty

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

// 侧面加固 + 需要配件 + 假门需要配件：统一在 watch(extraTypeList) 里处理
watch(extraTypeList, (val) => {
  // ===== 1. 侧面加固 =====
  const hasReinforce = val.includes('侧面加固')
  const reinforceIdx = (tableData as any[]).findIndex((r) => r.mingcheng === '加固')

  if (hasReinforce && reinforceIdx === -1) {
    const zhongIdx = (tableData as any[]).findIndex((r) => r.mingcheng === '中柱')
    const insertAt = zhongIdx >= 0 ? zhongIdx + 1 : (tableData as any[]).length
    ;(tableData as any[]).splice(insertAt, 0, {
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
    })
    bumpTableDataVersion()
  } else if (!hasReinforce && reinforceIdx >= 0) {
    ;(tableData as any[]).splice(reinforceIdx, 1)
    bumpTableDataVersion()
  }

  // ===== 2. 需要配件 / 假门需要配件（互斥，以最后勾选的为准）=====
  const hasPeijian = val.includes('需要配件')
  const hasJiaMen = val.includes('假门-需要配件')
  const needAny = hasPeijian || hasJiaMen

  if (needAny) {
    // 添加还不在 allAccessories 里的配件项
    for (const name of PEIJIAN_NAMES) {
      if (!allAccessories.find((a) => a.name === name)) {
        allAccessories.push({ name, value: '' })
      }
    }
    // 立即计算一次（假门模式优先）
    recalcPeijian(hasJiaMen ? 'jiamen' : 'normal')
  } else {
    // 两个都没勾，移除所有配件项
    for (let i = allAccessories.length - 1; i >= 0; i--) {
      if (PEIJIAN_NAMES.includes(allAccessories[i]?.name ?? '')) {
        allAccessories.splice(i, 1)
      }
    }
  }

  // ===== 3. 需要底板：底部门板区“门板”后插入“底板” =====
  const hasDiBan = val.includes('需要底板')
  const diBanIdx = doorPanelRows.value.findIndex((r: any) => r.name === '底板')

  if (hasDiBan && diBanIdx === -1) {
    const menBanIdx = doorPanelRows.value.findIndex((r: any) => r.name === '门板')
    const insertAt = menBanIdx >= 0 ? menBanIdx + 1 : doorPanelRows.value.length
    doorPanelRows.value.splice(insertAt, 0, {
      name: '底板',
      shuju1: '',
      shuju2: '',
      shuliang: '',
      beizhu: '',
    } as any)
    recalcDiBan()
  } else if (!hasDiBan && diBanIdx >= 0) {
    doorPanelRows.value.splice(diBanIdx, 1)
  }
})

// 需要底板：底板行的值计算
// shuju1 = (长度 - 82) / 门板数量（保留1位小数），shuju2 = 宽度 - 126，shuliang = 门板数量 * qty
function recalcDiBan() {
  const diBan = doorPanelRows.value.find((r: any) => r.name === '底板')
  if (!diBan) return
  const doorCount = Number(info.doorCount) || 0
  const qty = Number(info.quantity) || 1
  if (info.length && doorCount > 0) {
    diBan.shuju1 = ((Number(info.length) - 82) / doorCount).toFixed(1)
  } else {
    diBan.shuju1 = ''
  }
  diBan.shuju2 = info.width ? String(Number(info.width) - 126) : ''
  diBan.shuliang = doorCount > 0 ? String(doorCount * qty) : ''
}

// 监听尺寸/门板数量/数量变化，实时同步底板计算
watch(
  () => [info.length, info.width, info.doorCount, info.quantity],
  () => {
    if (extraTypeList.value.includes('需要底板')) {
      recalcDiBan()
    }
  },
)

// 监听相关数值变化，实时重算配件数量
watch(
  () => [filteredTableData.value, info.doorCount, info.quantity],
  () => {
    const hasJiaMen = extraTypeList.value.includes('假门-需要配件')
    const hasPeijian = extraTypeList.value.includes('需要配件')
    if (hasJiaMen) recalcPeijian('jiamen')
    else if (hasPeijian) recalcPeijian('normal')
  },
  { deep: true },
)

// 页面唯一标识，用于本地存储
const PAGE_KEY = '天枢款-双面门'

// 保存表格数据点击事件
const handleSave = () => {
  saveTableData(PAGE_KEY, info, filteredTableData.value, filteredDoorPanelRows.value, allAccessories)
}

// 下载表格点击事件
const handleDownload = async () => {
  // 仅在点击时才加载图片，不进首屏 bundle
  const imageModules = await loadImageModules()
  await downloadTable(
    '天枢款-圆弧-双面门',
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
      excludeList.value = [] // 同步清空不生成选项
      extraTypeList.value = [] // 同步清空增加类型（移除加固行等）
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
      // surface 直接绑定 info.surface，无需额外同步
    }
  } else {
    setCurrentOrderId(null)
    loadTableData(PAGE_KEY, info, tableData, doorPanelRows.value, allAccessories)
  }

  // 加载完数据后，若保存的主表格含"加固"行则自动勾选"侧面加固"
  try {
    const saved = localStorage.getItem(`table_save_${PAGE_KEY}`)
    if (saved) {
      const data = JSON.parse(saved)
      const rows: Array<{ mingcheng?: string }> = data?.tableRows || []
      if (rows.some((r) => r?.mingcheng === '加固') && !extraTypeList.value.includes('侧面加固')) {
        extraTypeList.value = [...extraTypeList.value, '侧面加固']
      }
      // 检测保存的底部门板中是否含“底板”行
      const doorRows: Array<{ name?: string }> = data?.doorPanelRows || []
      if (
        doorRows.some((r) => r?.name === '底板') &&
        !extraTypeList.value.includes('需要底板')
      ) {
        extraTypeList.value = [...extraTypeList.value, '需要底板']
      }
    }
  } catch { /* 忽略恢复失败 */ }

  // 从订单管理加载场景：检测当前 doorPanelRows 中是否含“底板”行
  if (
    doorPanelRows.value.some((r: any) => r?.name === '底板') &&
    !extraTypeList.value.includes('需要底板')
  ) {
    extraTypeList.value = [...extraTypeList.value, '需要底板']
  }
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
