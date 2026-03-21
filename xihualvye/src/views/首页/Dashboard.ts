import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getOrderStatsByPageType } from '@/ts/api'
import { menuArr } from '@/router/menu'

// 获取天枢款 children 的 title 列表（作为柱状图横向数据）
const tianshuMenu = menuArr.find((item) => item.name === 'tianshu')
const tianshuTitles = tianshuMenu?.children?.map((child) => child.title) || []

// 菜单 title → 后端 page_type 的映射
// 因为菜单 title 和组件保存时的 PAGE_KEY 可能不完全一致
// 例如：菜单写的是"天枢款-双面门款"，但组件保存到数据库的是"天枢款-双面门"
const titleToPageTypeMap: Record<string, string> = {
  '天枢款-常用款': '天枢款-常用款',
  '天枢款-无上包边款': '天枢款-无上包边款',
  '天枢款-单门-加背板': '天枢款-单门-加背板',
  '天枢款-单门-加背板-加固': '天枢款-单门-加背板-加固',
  '天枢款-双面门款': '天枢款-双面门',
  '天枢款-双面门款-背面假门': '天枢款-双面门-背面假门',
}

// 根据菜单 title 查找对应 page_type 的统计数量
function matchTitleToPageType(title: string, pageTypes: Map<string, number>): number {
  // 先通过映射表转换为后端实际的 page_type
  const pageType = titleToPageTypeMap[title] || title
  if (pageTypes.has(pageType)) {
    return pageTypes.get(pageType)!
  }
  return 0
}

export function useDashboard() {
  const barChartRef = ref<HTMLElement | null>(null)
  let barChart: echarts.ECharts | null = null

  const loading = ref(true)
  const noData = ref(false)
  const totalOrders = ref(0)
  const totalQuantity = ref(0)
  const typeCount = ref(0)

  // 初始化柱状图
  function initBarChart(categories: string[], values: number[]) {
    if (!barChartRef.value) return

    barChart = echarts.init(barChartRef.value)

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0]
          return `${data.name}<br/>数量：<strong>${data.value}</strong> 套`
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          rotate: 20,
          fontSize: 12,
          color: '#333',
          interval: 0,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        name: '数量（套）',
        nameTextStyle: {
          fontSize: 13,
          color: '#666',
        },
        axisLabel: {
          fontSize: 12,
          color: '#666',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#e8e8e8',
          },
        },
      },
      series: [
        {
          name: '订单数量',
          type: 'bar',
          barWidth: '50%',
          data: values,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#409EFF' },
              { offset: 1, color: '#79bbff' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#337ecc' },
                { offset: 1, color: '#409EFF' },
              ]),
            },
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 13,
            fontWeight: 'bold',
            color: '#409EFF',
          },
        },
      ],
    }

    barChart.setOption(option)
  }

  // 加载统计数据
  async function loadStats() {
    loading.value = true
    try {
      const res = await getOrderStatsByPageType()
      if (res.code === 0 && res.data) {
        const stats = res.data

        // 构建 pageType → totalQuantity 映射
        const pageTypeMap = new Map<string, number>()
        for (const s of stats) {
          pageTypeMap.set(s.page_type, s.total_quantity)
        }

        // typeCount 只统计天枢款型号种类，排除自由选择
        const tianshuPageTypes = new Set(Object.values(titleToPageTypeMap))
        const tianshuStats = stats.filter((s) => tianshuPageTypes.has(s.page_type))
        typeCount.value = tianshuStats.length

        // 天枢款各型号的数量（按菜单 children 的 title 顺序）
        const values = tianshuTitles.map((title) => matchTitleToPageType(title, pageTypeMap))

        // 计算汇总数据
        totalOrders.value = stats.reduce((sum, s) => sum + s.order_count, 0)
        totalQuantity.value = stats.reduce((sum, s) => sum + s.total_quantity, 0)

        noData.value = values.every((v) => v === 0) && stats.length === 0

        await nextTick()
        initBarChart(tianshuTitles, values)
      }
    } catch (e) {
      console.error('加载统计数据失败:', e)
      noData.value = true
    } finally {
      loading.value = false
    }
  }

  // 窗口大小变化时重绘
  function handleResize() {
    barChart?.resize()
  }

  onMounted(() => {
    loadStats()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    barChart?.dispose()
  })

  return {
    barChartRef,
    loading,
    noData,
    totalOrders,
    totalQuantity,
    typeCount,
  }
}
