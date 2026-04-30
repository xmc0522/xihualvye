import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getOrderStatsByPageType, getOrderList } from '@/ts/api'
import type { OrderListItem } from '@/ts/api'

// 三大款式分类
const CATEGORIES = ['天枢款', '天权款', '天璇款']

// 获取最近 N 天的日期字符串列表（YYYY/MM/DD 格式）
function getRecentDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    days.push(`${yyyy}/${mm}/${dd}`)
  }
  return days
}

export function useDashboard() {
  const barChartRef = ref<HTMLElement | null>(null)
  const lineChartRef = ref<HTMLElement | null>(null)
  const pieChartRef = ref<HTMLElement | null>(null)
  let barChart: echarts.ECharts | null = null
  let lineChart: echarts.ECharts | null = null
  let pieChart: echarts.ECharts | null = null

  const loading = ref(true)
  const noData = ref(false)
  const totalOrders = ref(0)
  const totalQuantity = ref(0)
  const todayOrders = ref(0)        // 今日新增订单数
  const monthOrders = ref(0)        // 本月新增订单数
  const recentOrders = ref<OrderListItem[]>([])  // 最近10条订单
  const lineRange = ref<7 | 30>(7)  // 折线图天数范围
  let cachedOrders: OrderListItem[] = []  // 缓存所有订单，用于切换天数时复用

  // 各状态订单数量（待生产 / 生产中 / 已完成）
  const statusCounts = ref({
    pending: 0,
    producing: 0,
    completed: 0,
  })

  // 根据当前 lineRange 重新渲染折线图
  function refreshLineChart() {
    if (!cachedOrders.length) return
    const getOrderDay = (o: OrderListItem): string => {
      const src = o.updated_at || o.created_at || ''
      return src.slice(0, 10).replace(/-/g, '/')
    }
    const days = getRecentDays(lineRange.value)
    const counts = days.map((day) => cachedOrders.filter((o) => getOrderDay(o) === day).length)
    initLineChart(days, counts)
  }

  // 外部调用：切换折线图天数
  function setLineRange(n: 7 | 30) {
    lineRange.value = n
    refreshLineChart()
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
    } as echarts.EChartsOption)
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
    } as echarts.EChartsOption)
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
    } as echarts.EChartsOption)
  }

  // ========== 加载所有数据 ==========
  async function loadStats() {
    loading.value = true
    try {
      // 1. 按款式统计
      const statsRes = await getOrderStatsByPageType()
      if (statsRes.code === 0 && statsRes.data) {
        const stats = statsRes.data

        // 三大类汇总
        const categoryQuantity: Record<string, number> = { 天枢款: 0, 天权款: 0, 天璇款: 0 }
        for (const s of stats) {
          for (const cat of CATEGORIES) {
            if (s.page_type.includes(cat)) {
              categoryQuantity[cat] = (categoryQuantity[cat] ?? 0) + s.total_quantity
              break
            }
          }
        }

        totalOrders.value = stats.reduce((sum, s) => sum + s.order_count, 0)
        totalQuantity.value = stats.reduce((sum, s) => sum + s.total_quantity, 0)

        noData.value = stats.length === 0

        const barValues = CATEGORIES.map((cat) => categoryQuantity[cat] ?? 0)
        const pieData = CATEGORIES
          .map((cat) => ({ name: cat, value: categoryQuantity[cat] ?? 0 }))
          .filter((d) => d.value > 0)

        await nextTick()
        initBarChart(CATEGORIES, barValues)
        if (pieData.length > 0) initPieChart(pieData)
      }

      // 2. 拉取所有订单，做近期统计 & 最近10条列表
      const listRes = await getOrderList({ page: 1, pageSize: 500 })
      if (listRes.code === 0 && listRes.data) {
        const allOrders = listRes.data.list
        cachedOrders = allOrders  // 缓存供切换天数时使用

        // 从订单的 updated_at（格式 "YYYY-MM-DD HH:MM:SS"）提取日期部分并转为 YYYY/MM/DD
        const getOrderDay = (o: OrderListItem): string => {
          const src = o.updated_at || o.created_at || ''
          // 兼容 "YYYY-MM-DD ..." 与 "YYYY/MM/DD ..."
          const datePart = src.slice(0, 10).replace(/-/g, '/')
          return datePart
        }

        // 折线图（按当前选中天数统计）
        const days = getRecentDays(lineRange.value)
        const dayCounts = days.map((day) =>
          allOrders.filter((o) => getOrderDay(o) === day).length
        )

        // 今日新增（按录入时间）
        const todayDays = getRecentDays(1)
        const today = todayDays[todayDays.length - 1] ?? ''
        todayOrders.value = allOrders.filter((o) => getOrderDay(o) === today).length

        // 本月新增（按录入时间的 YYYY/MM）
        const thisMonth = today.slice(0, 7)
        monthOrders.value = allOrders.filter((o) => getOrderDay(o).startsWith(thisMonth)).length

        // 各状态订单数量（基于订单列表实时统计，无缓存）
        const counts = { pending: 0, producing: 0, completed: 0 }
        for (const o of allOrders) {
          const s = (o.status || 'pending') as keyof typeof counts
          if (counts[s] !== undefined) counts[s]++
          else counts.pending++ // 未知状态归为待生产
        }
        statusCounts.value = counts

        await nextTick()
        initLineChart(days, dayCounts)

        // 最近10条（按 updated_at 倒序，后端已按 date DESC 排序，取前10）
        recentOrders.value = allOrders.slice(0, 10)
      }
    } catch (e) {
      console.error('加载统计数据失败:', e)
      noData.value = true
    } finally {
      loading.value = false
    }
  }

  function handleResize() {
    barChart?.resize()
    lineChart?.resize()
    pieChart?.resize()
  }

  onMounted(() => {
    loadStats()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
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
