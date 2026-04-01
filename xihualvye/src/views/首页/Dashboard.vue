<template>
  <div class="dashboard-container">

    <!-- 顶部概览卡片 -->
    <div class="overview-cards">
      <div class="card card-total">
        <div class="card-icon">📦</div>
        <div class="card-info">
          <div class="card-value">{{ totalOrders }}</div>
          <div class="card-label">总订单数</div>
        </div>
      </div>
      <div class="card card-quantity">
        <div class="card-icon">📊</div>
        <div class="card-info">
          <div class="card-value">{{ totalQuantity }}</div>
          <div class="card-label">总数量（套）</div>
        </div>
      </div>
      <div class="card card-today">
        <div class="card-icon">🗓️</div>
        <div class="card-info">
          <div class="card-value">{{ todayOrders }}</div>
          <div class="card-label">今日新增订单</div>
        </div>
      </div>
      <div class="card card-month">
        <div class="card-icon">📅</div>
        <div class="card-info">
          <div class="card-value">{{ monthOrders }}</div>
          <div class="card-label">本月新增订单</div>
        </div>
      </div>
    </div>

    <!-- 第一行：柱状图独占 -->
    <div class="chart-section" style="margin-bottom: 20px">
      <div class="chart-header">
        <h3>📊 三大款式订单数量统计</h3>
      </div>
      <div ref="barChartRef" class="chart-container"></div>
      <div v-if="loading" class="chart-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-if="!loading && noData" class="chart-empty">
        <el-empty description="暂无订单数据" />
      </div>
    </div>

    <!-- 第二行：饼图 + 折线图各占一半 -->
    <div class="charts-row">
      <!-- 饼图 -->
      <div class="chart-section chart-section-half">
        <div class="chart-header">
          <h3>🥧 款式套数占比</h3>
        </div>
        <div ref="pieChartRef" class="chart-container"></div>
        <div v-if="loading" class="chart-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
        <div v-if="!loading && noData" class="chart-empty">
          <el-empty description="暂无订单数据" />
        </div>
      </div>

      <!-- 折线图 -->
      <div class="chart-section chart-section-half">
        <div class="chart-header">
          <h3>📈 近 7 天每日新增订单趋势</h3>
        </div>
        <div ref="lineChartRef" class="chart-container"></div>
        <div v-if="loading" class="chart-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>加载中...</span>
        </div>
      </div>
    </div>

    <!-- 第三行：最近订单列表 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>🕒 最近 10 条订单</h3>
      </div>
      <el-table
        :data="recentOrders"
        size="small"
        stripe
        style="width: 100%"
        max-height="162"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        :cell-style="{ color: '#303133' }"
      >
        <el-table-column prop="customer" label="客户" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">
            <span style="color: #1890ff; font-weight: 500">{{ row.customer }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="order_no" label="单号" min-width="90" show-overflow-tooltip />
        <el-table-column prop="date" label="日期" min-width="100" />
        <el-table-column prop="page_type" label="款式" min-width="160" show-overflow-tooltip />
        <el-table-column prop="surface" label="表面" min-width="80" />
        <el-table-column label="尺寸" min-width="150">
          <template #default="{ row }">
            <span style="font-size: 12px; color: #606266">
              {{ row.length || '-' }} × {{ row.width || '-' }} × {{ row.height || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量(套)" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.quantity || '-' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" min-width="160" />
      </el-table>
      <div v-if="!loading && recentOrders.length === 0" class="chart-empty">
        <el-empty description="暂无订单数据" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { useDashboard } from './Dashboard'

const {
  barChartRef,
  lineChartRef,
  pieChartRef,
  loading,
  noData,
  totalOrders,
  totalQuantity,
  todayOrders,
  monthOrders,
  recentOrders,
} = useDashboard()
</script>

<style scoped src="./Dashboard.css"></style>
