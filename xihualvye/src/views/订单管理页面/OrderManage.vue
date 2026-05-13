<template>
  <div class="order-manage">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户">
          <el-input
            v-model="searchForm.customer"
            placeholder="请输入客户名"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入单号"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="款式">
          <el-select
            v-model="searchForm.pageType"
            placeholder="全部款式"
            clearable
            style="width: 150px"
          >
            <el-option label="天枢款" value="天枢款" />
            <el-option label="天权款" value="天权款" />
            <el-option label="天璇款" value="天璇款" />
          </el-select>
        </el-form-item>
        <el-form-item label="表面">
          <el-select
            v-model="searchForm.surface"
            placeholder="全部表面"
            clearable
            style="width: 130px"
          >
            <el-option label="幻夜黑" value="幻夜黑" />
            <el-option label="米兰灰" value="米兰灰" />
            <el-option label="冰川白" value="冰川白" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 130px"
          >
            <el-option
              v-for="opt in ORDER_STATUS_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            >
              <span class="status-dot" :class="`status-tag-${opt.color}`" style="margin-right: 8px"></span>
              {{ opt.label }}
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="订单日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY/MM/DD"
            style="width: 260px"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
        批量删除 ({{ selectedIds.length }})
      </el-button>
      <el-button @click="colSettingVisible = true">
        <el-icon style="margin-right: 4px"><Setting /></el-icon>列设置
      </el-button>
      <span class="total-info">共 {{ total }} 条订单</span>
    </div>

    <!-- 订单表格 -->
    <el-table
      :data="orderList"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载订单中..."
      element-loading-background="rgba(255, 255, 255, 0.7)"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#333', textAlign: 'center' }"
      :cell-style="{ textAlign: 'center' }"
      :row-class-name="getRowClassName"
      ref="tableRef"
    >
      <el-table-column type="selection" width="50" fixed="left" />
      <!-- <el-table-column prop="id" label="ID" width="60" /> -->
      <el-table-column
        prop="customer"
        label="客户"
        min-width="120"
        show-overflow-tooltip
        fixed="left"
      >
        <template #default="{ row }">
          <span style="color: #1890ff; font-weight: 500">{{ row.customer }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="isColVisible('order_no')" prop="order_no" label="单号" min-width="80" show-overflow-tooltip />
      <el-table-column v-if="isColVisible('date')" prop="date" label="日期" min-width="100" />
      <el-table-column v-if="isColVisible('page_type')" prop="page_type" label="款式" min-width="190" show-overflow-tooltip />
      <el-table-column v-if="isColVisible('surface')" prop="surface" label="表面" min-width="80" />
      <el-table-column v-if="isColVisible('quantity')" prop="quantity" label="数量/套" width="80" />
      <el-table-column v-if="isColVisible('size')" label="尺寸 (长×宽×高)" min-width="170">
        <template #default="{ row }">
          {{ row.length || '-' }} × {{ row.width || '-' }} × {{ row.height || '-' }}
        </template>
      </el-table-column>
      <el-table-column v-if="isColVisible('remark')" prop="remark" label="工艺备注" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.remark }}
        </template>
      </el-table-column>
      <el-table-column v-if="isColVisible('status')" label="状态" width="150" align="center">
        <template #default="{ row }">
          <el-dropdown trigger="click" @command="(s: any) => handleStatusChange(row, s)">
            <span
              class="status-tag"
              :class="`status-tag-${ORDER_STATUS_OPTIONS.find((o) => o.value === (row.status || 'pending'))?.color || 'info'}`"
            >
              <span class="status-dot"></span>
              <span class="status-text">
                {{ ORDER_STATUS_OPTIONS.find((o) => o.value === (row.status || 'pending'))?.label || '待生产' }}
              </span>
              <el-icon class="status-arrow"><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="opt in ORDER_STATUS_OPTIONS"
                  :key="opt.value"
                  :command="opt.value"
                  :disabled="(row.status || 'pending') === opt.value"
                >
                  <span class="status-dot" :class="`status-tag-${opt.color}`" style="margin-right: 8px"></span>
                  {{ opt.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" >
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleLoad(row)">加载</el-button>
          <el-button type="info" size="small" @click="handleView(row)">详情</el-button>
          <!-- <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button> -->
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column v-if="isColVisible('updated_at')" prop="updated_at" label="最新更改订单的时间" min-width="180" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="700px" top="5vh">
      <div v-if="detailData" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户">{{ detailData.customer }}</el-descriptions-item>
          <el-descriptions-item label="单号">{{ detailData.order_no }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ detailData.date }}</el-descriptions-item>
          <el-descriptions-item label="表面">{{ detailData.surface }}</el-descriptions-item>
          <el-descriptions-item label="数量">{{ detailData.quantity }}</el-descriptions-item>
          <el-descriptions-item label="款式">{{ detailData.page_type }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <span
              class="status-tag"
              :class="`status-tag-${ORDER_STATUS_OPTIONS.find((o) => o.value === (detailData?.status || 'pending'))?.color || 'info'}`"
              style="cursor: default"
            >
              <span class="status-dot"></span>
              <span class="status-text">
                {{ ORDER_STATUS_OPTIONS.find((o) => o.value === (detailData?.status || 'pending'))?.label || '待生产' }}
              </span>
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="长度">{{ detailData.length }}</el-descriptions-item>
          <el-descriptions-item label="宽度">{{ detailData.width }}</el-descriptions-item>
          <el-descriptions-item label="高度">{{ detailData.height }}</el-descriptions-item>
          <el-descriptions-item label="门数量">{{ detailData.door_count }}</el-descriptions-item>
          <el-descriptions-item label="中柱数量">{{ detailData.zhong_count }}</el-descriptions-item>
          <el-descriptions-item label="工艺备注" :span="2">{{
            detailData.remark || '无'
          }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 16px">主表格数据</h4>
        <el-table :data="detailData.table_data" border size="small" max-height="200">
          <el-table-column prop="mingcheng" label="名称" />
          <el-table-column prop="guige" label="规格" width="80" />
          <el-table-column prop="shuliang" label="数量" width="80" />
          <el-table-column prop="beizhu" label="备注" />
        </el-table>

        <h4 style="margin-top: 16px">底部门板</h4>
        <el-table :data="detailData.door_panels" border size="small" max-height="150">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="shuju1" label="数据1" width="80" />
          <el-table-column prop="shuju2" label="数据2" width="80" />
          <el-table-column prop="shuliang" label="数量" width="80" />
          <el-table-column prop="beizhu" label="备注" />
        </el-table>

        <h4 style="margin-top: 16px">配件</h4>
        <el-table :data="detailData.accessories" border size="small" max-height="150">
          <el-table-column prop="name" label="名称" />
          <el-table-column prop="value" label="数值" width="100" />
        </el-table>
      </div>
    </el-dialog>

    <!-- 列设置弹窗 -->
    <el-dialog v-model="colSettingVisible" title="列显示设置" width="420px">
      <div style="margin-bottom: 12px; color: #909399; font-size: 13px">
        勾选的列将在订单列表中显示（设置自动保存到本地）
      </div>
      <el-checkbox-group :model-value="visibleCols" @update:model-value="(v: any) => saveVisibleCols(v)">
        <div v-for="col in allColumns" :key="col.key" style="margin-bottom: 8px">
          <el-checkbox :value="col.key" :label="col.label" />
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="resetCols">重置默认</el-button>
        <el-button type="primary" @click="colSettingVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editVisible" title="编辑订单" width="700px" top="5vh">
      <el-form v-if="editForm" :model="editForm" label-width="80px" class="edit-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="客户">
              <el-input v-model="editForm.customer" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单号">
              <el-input v-model="editForm.orderNo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="日期">
              <el-input v-model="editForm.date" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表面">
              <el-input v-model="editForm.surface" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="数量">
              <el-input v-model="editForm.quantity" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="款式">
              <el-select v-model="editForm.pageType" style="width: 100%">
                <el-option label="天枢款" value="天枢款" />
                <el-option label="天枢款-常用款" value="天枢款-常用款" />
                <el-option label="天枢款-无上包边" value="天枢款-无上包边" />
                <el-option label="天枢款-单门-加背板" value="天枢款-单门-加背板" />
                <el-option label="天枢款-单门-加背板-加固" value="天枢款-单门-加背板-加固" />
                <el-option label="天枢款-双面门" value="天枢款-双面门" />
                <el-option label="天枢款-双面门-背面假门" value="天枢款-双面门-背面假门" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="长度">
              <el-input v-model="editForm.length" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="宽度">
              <el-input v-model="editForm.width" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="高度">
              <el-input v-model="editForm.height" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="门数量">
              <el-input v-model="editForm.doorCount" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="中柱数量">
              <el-input v-model="editForm.zhongCount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="工艺备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="handleEditSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { CaretBottom, Setting } from '@element-plus/icons-vue'
import { useOrderManage } from './OrderManage'

const {
  searchForm,
  orderList,
  loading,
  total,
  currentPage,
  pageSize,
  selectedIds,
  tableRef,
  detailVisible,
  detailData,
  editVisible,
  editSaving,
  editForm,
  handleSearch,
  handleReset,
  handleSelectionChange,
  handleLoad,
  handleView,
  handleEdit,
  handleEditSave,
  handleDelete,
  handleBatchDelete,
  handleStatusChange,
  getRowClassName,
  ORDER_STATUS_OPTIONS,
  // 列设置
  allColumns,
  visibleCols,
  isColVisible,
  saveVisibleCols,
  resetCols,
  colSettingVisible,
} = useOrderManage()
</script>

<style scoped src="./OrderManage.css"></style>
