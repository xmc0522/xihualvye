import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// 按需引入 echarts，减少首屏体积（完整 echarts ~1MB → 按需 ~400KB）
import * as echarts from 'echarts/core'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption as EChartsOption, ECharts } from 'echarts/core'

// 一次性注册图表所需模块
echarts.use([
  BarChart,
  LineChart,
  PieChart,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer,
])

import { getDashboardStats } from '@/ts/api'
import type { OrderListItem } from '@/ts/api'

// 三大款式分类
const CATEGORIES = ['天枢款', '天权款', '天璇款']

export function useDashboard() {
  const barChartRef = ref<HTMLElement | null>(null)
  const lineChartRef = ref<HTMLElement | null>(null)
  const pieChartRef = ref<HTMLElement | null>(null)
  let barChart: ECharts | null = null
  let lineChart: ECharts | null = null
  let pieChart: ECharts | null = null

  const loading = ref(true)
  const noData = ref(false)
  const totalOrders = ref(0)
  const totalQuantity = ref(0)
  const todayOrders = ref(0)        // 今日新增订单数
  const monthOrders = ref(0)        // 本月新增订单数
  const recentOrders = ref<OrderListItem[]>([])  // 最近10条订单
  const lineRange = ref<7 | 30>(7)  // 折线图天数范围

  // 各状态订单数量（待生产 / 生产中 / 已完成）
  const statusCounts = ref({
    pending: 0,
    producing: 0,
    completed: 0,
  })

  // 外部调用：切换折线图天数 → 重新拉取后端聚合数据
  function setLineRange(n: 7 | 30) {
    if (lineRange.value === n) return
    lineRange.value = n
    void loadStats()
  }

  // ========== 柱状图：三大款式数量 ==========
  // 与饼图保持一致的三大款式颜色（天枢款蓝、天权款橙、天璇款红）
  const BAR_COLORS = [
    { main: '#409EFF', light: '#79bbff', dark: '#337ecc' },
    { main: '#e6a23c', light: '#f5c678', dark: '#cf8510' },
    { main: '#f56c6c', light: '#fab6b6', dark: '#dd4444' },
  ] as const
  // 首项作为兜底，类型保证非空
  const DEFAULT_BAR_COLOR = BAR_COLORS[0]

  function initBarChart(categories: string[], values: number[]) {
    if (!barChartRef.value) return
    if (!barChart) barChart = echarts.init(barChartRef.value)

    // 每根柱子独立颜色
    const barData = values.map((v, i) => {
      const c = BAR_COLORS[i] ?? DEFAULT_BAR_COLOR
      return {
        value: v,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: c.main },
            { offset: 1, color: c.light },
          ]),
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: c.dark },
              { offset: 1, color: c.main },
            ]),
          },
        },
      }
    })

    barChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const d = params[0]
          return `${d.name}<br/>数量：<strong>${d.value}</strong> 套`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: { fontSize: 14, color: '#333' },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        name: '数量（套）',
        nameTextStyle: { fontSize: 13, color: '#666' },
        axisLabel: { fontSize: 12, color: '#666' },
        splitLine: { lineStyle: { type: 'dashed', color: '#e8e8e8' } },
        minInterval: 1,
      },
      series: [{
        name: '订单数量',
        type: 'bar',
        barWidth: '40%',
        data: barData,
        label: {
          show: true,
          position: 'top',
          fontSize: 14,
          fontWeight: 'bold',
          color: 'inherit',
        },
      }],
    } as EChartsOption)
  }

  // ========== 折线图：近7天每日新增订单数 ==========
  function initLineChart(days: string[], counts: number[]) {
    if (!lineChartRef.value) return
    if (!lineChart) lineChart = echarts.init(lineChartRef.value)

    // X 轴显示为 MM/DD 格式
    const labels = days.map((d) => d.slice(5))

    lineChart.setOption({
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const d = params[0]
          return `${days[d.dataIndex]}<br/>新增订单：<strong>${d.value}</strong> 单`
        },
      },
      grid: { left: '3%', right: '4%', bottom: '8%', top: '12%', containLabel: true },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 12, color: '#555' },
        axisLine: { lineStyle: { color: '#ddd' } },
      },
      yAxis: {
        type: 'value',
        name: '订单数',
        nameLocation: 'end',
        nameGap: 15,
        nameTextStyle: {
          fontSize: 12,
          color: '#666',
          align: 'left',
          padding: [0, 0, 0, -45],
        },
        axisLabel: { fontSize: 12, color: '#666' },
        minInterval: 1,
        splitLine: { lineStyle: { type: 'dashed', color: '#e8e8e8' } },
      },
      series: [{
        name: '新增订单',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        data: counts,
        lineStyle: { color: '#67c23a', width: 3 },
        itemStyle: { color: '#67c23a', borderColor: '#fff', borderWidth: 2 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103,194,58,0.25)' },
            { offset: 1, color: 'rgba(103,194,58,0.02)' },
          ]),
        },
        label: { show: true, position: 'top', fontSize: 12, color: '#67c23a' },
      }],
    } as EChartsOption)
  }

  // ========== 饼图：三大款式套数占比 ==========
  function initPieChart(pieData: { name: string; value: number }[]) {
    if (!pieChartRef.value) return
    if (!pieChart) pieChart = echarts.init(pieChartRef.value)

    const colors = ['#409EFF', '#e6a23c', '#f56c6c']

    pieChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c} 套 ({d}%)',
      },
      legend: {
        orient: 'horizontal',
        bottom: 8,
        textStyle: { fontSize: 13, color: '#555' },
      },
      series: [{
        name: '款式占比',
        type: 'pie',
        radius: ['38%', '65%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          fontSize: 12,
          color: '#555',
        },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' },
        },
        data: pieData.map((d, i) => ({ ...d, itemStyle: { color: colors[i % colors.length] } })),
      }],
    } as EChartsOption)
  }

  // ========== 加载所有数据（一站式后端聚合） ==========
  async function loadStats() {
    loading.value = true
    try {
      const res = await getDashboardStats(lineRange.value)
      if (res.code !== 0 || !res.data) {
        noData.value = true
        return
      }
      const d = res.data

      // 总计数量
      totalOrders.value = d.totalOrders
      totalQuantity.value = d.totalQuantity
      todayOrders.value = d.todayOrders
      monthOrders.value = d.monthOrders
      statusCounts.value = d.statusCounts
      recentOrders.value = d.recentOrders
      noData.value = d.totalOrders === 0

      // 柱状图 / 饼图：三大款式数量
      const barValues = CATEGORIES.map((cat) => d.categoryQuantity[cat] || 0)
      const pieData = CATEGORIES
        .map((cat) => ({ name: cat, value: d.categoryQuantity[cat] || 0 }))
        .filter((x) => x.value > 0)

      await nextTick()
      initBarChart([...CATEGORIES], barValues)
      if (pieData.length > 0) initPieChart(pieData)

      // 折线图：后端返回的 dailyTrend 直接使用
      const days = d.dailyTrend.map((x) => x.date)
      const counts = d.dailyTrend.map((x) => x.count)
      initLineChart(days, counts)
    } catch (e) {
      console.error('加载统计数据失败:', e)
      noData.value = true
    } finally {
      loading.value = false
    }
  }

  // resize 事件高频触发（每秒可能上百次），用 requestAnimationFrame 节流到屏幕刷新率
  let resizeRaf: number | null = null
  function handleResize() {
    if (resizeRaf !== null) return
    resizeRaf = requestAnimationFrame(() => {
      barChart?.resize()
      lineChart?.resize()
      pieChart?.resize()
      resizeRaf = null
    })
  }

  onMounted(() => {
    loadStats()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    if (resizeRaf !== null) {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = null
    }
    barChart?.dispose()
    lineChart?.dispose()
    pieChart?.dispose()
  })

  return {
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
    statusCounts,
    lineRange,
    setLineRange,
  }
}
