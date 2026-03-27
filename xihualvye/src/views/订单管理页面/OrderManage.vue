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
            style="width: 180px"
          >
            <!-- <el-option label="天枢款-单面门-选择款" value="天枢款" /> -->
            <el-option label="天枢款-常用款" value="天枢款-常用款" />
            <el-option label="天枢款-无上包边" value="天枢款-无上包边" />
            <el-option label="天枢款-单门-加背板" value="天枢款-单门-加背板" />
            <el-option label="天枢款-单门-加背板-加固" value="天枢款-单门-加背板-加固" />
            <el-option label="天枢款-双面门" value="天枢款-双面门" />
            <el-option label="天枢款-双面门-背面假门" value="天枢款-双面门-背面假门" />
            <el-option label="天权款-常用款" value="天权款-常用款" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
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
      <span class="total-info">共 {{ total }} 条订单</span>
    </div>

    <!-- 订单表格 -->
    <el-table
      :data="orderList"
      border
      stripe
      v-loading="loading"
      @selection-change="handleSelectionChange"
      style="width: 100%"
      :header-cell-style="{ background: '#f5f7fa', color: '#333', textAlign: 'center' }"
      :cell-style="{ textAlign: 'center' }"
      :row-class-name="getRowClassName"
      ref="tableRef"
    >
      <el-table-column type="selection" width="50" fixed="left" />
      <!-- <el-table-column prop="id" label="ID" width="60" /> -->
      <el-table-column prop="customer" label="客户" min-width="120" show-overflow-tooltip fixed="left">
        <template #default="{ row }">
          <span style="color: #1890ff; font-weight: 500;">{{ row.customer }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="order_no" label="单号" min-width="120" show-overflow-tooltip />
      <el-table-column prop="date" label="日期" min-width="80" />
      <el-table-column prop="page_type" label="款式" min-width="180" show-overflow-tooltip />
      <el-table-column prop="surface" label="表面" min-width="80" />
      <el-table-column prop="quantity" label="数量/套" width="80" />
      <el-table-column label="尺寸 (长×宽×高)" min-width="90">
        <template #default="{ row }">
          {{ row.length || '-' }} × {{ row.width || '-' }} × {{ row.height || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="工艺备注" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.remark}}
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" min-width="90" />
      <el-table-column label="操作" width="260" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleLoad(row)">加载</el-button>
          <el-button type="info" size="small" @click="handleView(row)">详情</el-button>
          <!-- <el-button type="warning" size="small" @click="handleEdit(row)">编辑</el-button> -->
          <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
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
  getRowClassName,
} = useOrderManage()
</script>

<style scoped src="./OrderManage.css"></style>
