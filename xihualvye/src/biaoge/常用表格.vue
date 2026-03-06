<template>
  <div class="table-container">
    <!-- 标题 -->
    <div class="table-title">天枢款-圆弧</div>

    <!-- 基本信息区 -->
    <table class="info-table" border="1" cellspacing="0" cellpadding="0">
      <tr>
        <td class="label-cell">客户：</td>
        <td class="value-cell" colspan="2">{{ info.customer }}</td>
        <td class="label-cell">日期：</td>
        <td class="value-cell" colspan="2">{{ info.date }}</td>
      </tr>
      <tr>
        <td class="label-cell">表面：</td>
        <td class="value-cell">{{ info.surface }}</td>
        <td class="label-cell">数量：</td>
        <td class="value-cell">{{ info.quantity }}</td>
        <td class="label-cell">客户单号：</td>
        <td class="value-cell">{{ info.orderNo }}</td>
      </tr>
      <tr>
        <td class="label-cell">长度：</td>
        <td class="value-cell">{{ info.length }}</td>
        <td class="label-cell">宽度：</td>
        <td class="value-cell">{{ info.width }}</td>
        <td class="label-cell">高度：</td>
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
      :header-cell-style="{ background: '#fff', color: '#000', textAlign: 'center', fontWeight: 'normal' }"
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
      <el-table-column prop="shuliang" label="数量" width="60" />
      <el-table-column prop="beizhu" label="备注" min-width="100" />
    </el-table>

    <!-- 配件表 -->
    <table class="accessory-table" border="1" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="6" class="section-title">配件表</td>
      </tr>
      <tr v-for="(row, index) in accessoryRows" :key="index">
        <td class="acc-label">{{ row.name1 }}</td>
        <td class="acc-value">{{ row.value1 }}</td>
        <td class="acc-label">{{ row.name2 }}</td>
        <td class="acc-value">{{ row.value2 }}</td>
        <td class="acc-label" v-if="row.name3">{{ row.name3 }}</td>
        <td class="acc-value" v-if="row.value3 !== undefined">{{ row.value3 }}</td>
        <td v-if="!row.name3" colspan="2"></td>
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
import { reactive, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 批量导入JPG文件夹下的所有图片
const imageModules = import.meta.glob('../../JPG/*.jpg', { eager: true, import: 'default' }) as Record<string, string>

// 根据型号获取对应图片路径
const getImage = (xinghao: string) => {
  // 匹配键名中包含该型号的图片
  const key = Object.keys(imageModules).find(k => k.includes(xinghao))
  return key ? imageModules[key] : ''
}

// 从路由参数中获取不生成的名称列表
const excludeNames: string[] = (() => {
  try {
    const raw = route.query.excludeNames as string
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
})()

// 基本信息（从路由参数中动态获取）
const info = reactive({
  customer: (route.query.customer as string) || '',
  date: (route.query.date as string) || '',
  surface: (route.query.surface as string) || '',
  quantity: (route.query.quantity as string) || '',
  orderNo: (route.query.orderNo as string) || '',
  length: (route.query.length as string) || '',
  width: (route.query.width as string) || '',
  height: (route.query.height as string) || '',
  remark: '背留空'
})

// 主表格数据
const tableData = [
  { xinghao: 'H-1071', tupian: 'H-1071', mingcheng: '上包边', guige: '1416', shuliang: '2', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
  { xinghao: 'H-1071', tupian: 'H-1071', mingcheng: '上包边', guige: '516', shuliang: '2', beizhu: '打磨喷漆', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

  { xinghao: 'H-1072', tupian: 'H-1072', mingcheng: '下包边', guige: '1416', shuliang: '2', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
  { xinghao: 'H-1072', tupian: 'H-1072', mingcheng: '下包边', guige: '516', shuliang: '2', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

  { xinghao: 'H-1073', tupian: 'H-1073', mingcheng: '立柱', guige: '897', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1074', tupian: 'H-1074', mingcheng: '前后横梁', guige: '1420', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1075', tupian: 'H-1075', mingcheng: '侧横梁', guige: '460', shuliang: '4', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1076', tupian: 'H-1076', mingcheng: '中柱', guige: '810', shuliang: '4', beizhu: '冲孔', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1005', tupian: 'H-1005', mingcheng: '拉筋', guige: '498', shuliang: '6', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1005', tupian: 'H-1005', mingcheng: '横拉', guige: '460', shuliang: '1', beizhu: '', _mergeXinghao: 1, _mergeTupian: 1, _mergeMingcheng: 1 },

  { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '470.7', shuliang: '6', beizhu: '45度切', _mergeXinghao: 4, _mergeTupian: 4, _mergeMingcheng: 4 },
  { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '875', shuliang: '6', beizhu: '一半冲孔', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },
  { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '515', shuliang: '4', beizhu: '45度切', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },
  { xinghao: 'H-1077', tupian: 'H-1077', mingcheng: '门料', guige: '899', shuliang: '4', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

  { xinghao: '', tupian: '', mingcheng: '门板', guige: '467.9', shuliang: '', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
  { xinghao: '', tupian: '', mingcheng: '门板', guige: '872.2', shuliang: '3', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },

  { xinghao: '', tupian: '', mingcheng: '侧门板', guige: '512.2', shuliang: '', beizhu: '', _mergeXinghao: 2, _mergeTupian: 2, _mergeMingcheng: 2 },
  { xinghao: '', tupian: '', mingcheng: '侧门板', guige: '896.2', shuliang: '2', beizhu: '', _mergeXinghao: 0, _mergeTupian: 0, _mergeMingcheng: 0 },
]

// 根据不生成的名称过滤表格数据，并重新计算合并单元格
const filteredTableData = computed(() => {
  // 过滤掉被排除的名称对应的行
  const filtered = tableData.filter(row => !excludeNames.includes(row.mingcheng))

  // 重新计算合并标记
  const result = filtered.map((row, index) => ({ ...row }))
  for (let i = 0; i < result.length; i++) {
    const currentRow = result[i]
    if (!currentRow) continue
    // 计算当前行开始，连续相同名称的行数
    let count = 1
    while (i + count < result.length) {
      const nextRow = result[i + count]
      if (!nextRow || currentRow.mingcheng !== nextRow.mingcheng || currentRow.xinghao !== nextRow.xinghao) {
        break
      }
      count++
    }
    // 第一行设置 rowspan = count，后续行设置为 0（被合并）
    currentRow._mergeXinghao = count
    currentRow._mergeTupian = count
    currentRow._mergeMingcheng = count
    for (let j = 1; j < count; j++) {
      const mergedRow = result[i + j]
      if (mergedRow) {
        mergedRow._mergeXinghao = 0
        mergedRow._mergeTupian = 0
        mergedRow._mergeMingcheng = 0
      }
    }
    i += count - 1 // 跳过已处理的行
  }
  return result
})

// 合并单元格方法
const mergeMethod = ({ row, column, rowIndex, columnIndex }: any) => {
  // 对 型号(0)、图片(1)、名称(2) 列进行合并
  if (columnIndex <= 2) {
    const mergeKey = columnIndex === 0 ? '_mergeXinghao' : columnIndex === 1 ? '_mergeTupian' : '_mergeMingcheng'
    if (row[mergeKey] > 0) {
      return { rowspan: row[mergeKey], colspan: 1 }
    } else if (row[mergeKey] === 0) {
      return { rowspan: 0, colspan: 0 }
    }
  }

  return { rowspan: 1, colspan: 1 }
}

// 配件表数据
const accessoryRows = [
  { name1: '上包转角', value1: '4', name2: '下包转角', value2: '4', name3: '', value3: '' },
]
</script>

<style scoped>
.table-container {
  width: 700px;
  margin: 20px auto;
  font-size: 13px;
  color: #333;
}

.table-title {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  padding: 10px 0;
  border: 1px solid #333;
  border-bottom: none;
  background: #fff;
}

/* 基本信息表格 */
.info-table {
  width: 100%;
  border-collapse: collapse;
  border-color: #333;
}

.info-table td {
  padding: 6px 10px;
  border: 1px solid #333;
  height: 32px;
}

.label-cell {
  text-align: right;
  font-weight: normal;
  white-space: nowrap;
  width: 80px;
  background: #fff;
}

.value-cell {
  text-align: center;
  font-weight: bold;
}

/* 主数据表格 */
.main-table {
  border-color: #333;
}

.main-table :deep(.el-table__header th) {
  border-color: #333 !important;
}

.main-table :deep(.el-table__body td) {
  border-color: #333 !important;
  padding: 4px 0;
  height: 32px;
}

.main-table :deep(.el-table__inner-wrapper::before),
.main-table :deep(.el-table__border-left-patch) {
  background-color: #333;
}

.main-table :deep(.el-table td.el-table__cell),
.main-table :deep(.el-table th.el-table__cell.is-leaf) {
  border-color: #333;
}

/* 配件表 */
.accessory-table {
  width: 100%;
  border-collapse: collapse;
  border-color: #333;
  border-top: none;
}

.accessory-table td {
  padding: 6px 10px;
  border: 1px solid #333;
  height: 32px;
  text-align: center;
}

.section-title {
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  background: #fff;
}

.acc-label {
  width: 80px;
  white-space: nowrap;
}

.acc-value {
  width: 60px;
}

/* 工艺备注 */
.remark-table {
  width: 100%;
  border-collapse: collapse;
  border-color: #333;
  border-top: none;
}

.remark-table td {
  padding: 6px 10px;
  border: 1px solid #333;
  height: 32px;
  text-align: center;
}

.remark-content {
  height: auto;
  padding: 0 !important;
}

.remark-input :deep(.el-textarea__inner) {
  color: blue;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 6px 10px;
}

/* 表格内图片样式 */
.table-img {
  width: 140px;
  height: auto;
  max-height: 80px;
  object-fit: contain;
  display: block;
  margin: 2px auto;
}
</style>