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
      <div class="card card-types">
        <div class="card-icon">📋</div>
        <div class="card-info">
          <div class="card-value">{{ typeCount }}</div>
          <div class="card-label">型号种类</div>
        </div>
      </div>
    </div>

    <!-- 天枢款柱状图 -->
    <div class="chart-section">
      <div class="chart-header">
        <h3>天枢款 - 各型号订单数量统计</h3>
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
  </div>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'
import { useDashboard } from './Dashboard'

const { barChartRef, loading, noData, totalOrders, totalQuantity, typeCount } = useDashboard()
</script>

<style scoped src="./Dashboard.css"></style>
