import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, getOrderDetail, deleteOrder, batchDeleteOrders, updateOrder } from '@/ts/api'
import { setCurrentOrderId } from '@/ts/按钮/button2'
import type { OrderListItem, OrderDetail, OrderSavePayload } from '@/ts/api'

export function useOrderManage() {
  const router = useRouter()
  const route = useRoute()

  // 搜索表单
  const searchForm = ref({
    customer: '',
    orderNo: '',
    pageType: '',
    surface: '',
    dateRange: null as [string, string] | null,
  })

  // 表格数据
  const orderList = ref<OrderListItem[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedIds = ref<number[]>([])
  const highlightId = ref<number | null>(null)
  const tableRef = ref()
  const isFirstClickAfterReturn = ref(true) // 返回后首次点击不取消高亮

  // 详情弹窗
  const detailVisible = ref(false)
  const detailData = ref<OrderDetail | null>(null)

  // 编辑弹窗
  const editVisible = ref(false)
  const editSaving = ref(false)
  const editingId = ref<number>(0)
  const editForm = ref<OrderSavePayload>({
    customer: '',
    orderNo: '',
    date: '',
    surface: '',
    quantity: '',
    length: '',
    width: '',
    height: '',
    doorCount: '',
    zhongCount: '',
    remark: '',
    pageType: '',
    tableData: [],
    doorPanels: [],
    accessories: [],
  })

  // 款式 -> 路由路径映射
  const pageTypeRouteMap: Record<string, string> = {
    // 自由选择
    天枢款: '/zyxz/a',
    '天枢款-单面门-选择款': '/zyxz/a',
    '天枢款-双面门-选择款': '/zyxz/b',
    // 天枢款
    '天枢款-常用款': '/tianshu/c',
    '天枢款-无上包边': '/tianshu/d',
    '天枢款-无上包边款': '/tianshu/d',
    '天枢款-单门-加背板': '/tianshu/a',
    '天枢款-单门-加背板-加固': '/tianshu/b',
    '天枢款-双面门': '/tianshu/e',
    '天枢款-双面门-背面假门': '/tianshu/f',
    // 天权款
    '天权款-常用款': '/tianquan/a',
    '天权款-无上包边款': '/tianquan/d',
    '天权款-单门-加背板': '/tianquan/b',
    '天权款-单门-加背板-加固': '/tianquan/c',
    '天权款-双面门': '/tianquan/e',
    '天权款-双面门-背面假门': '/tianquan/f',
    // 天璇款
    '天璇款-常用款': '/tianxuan/c',
    '天璇款-无上包边款': '/tianxuan/d',
    '天璇款-单门-加背板': '/tianxuan/a',
    '天璇款-单门-加背板-加固': '/tianxuan/b',
    '天璇款-双面门': '/tianxuan/e',
    '天璇款-双面门-背面假门': '/tianxuan/f',
  }

  // 查询
  const handleSearch = async () => {
    loading.value = true
    try {
      const res = await getOrderList({
        customer: searchForm.value.customer,
        orderNo: searchForm.value.orderNo,
        pageType: searchForm.value.pageType,
        startDate: searchForm.value.dateRange?.[0] || '',
        endDate: searchForm.value.dateRange?.[1] || '',
        page: currentPage.value,
        pageSize: pageSize.value,
      })
      orderList.value = res.data.list
      total.value = res.data.total
    } catch (e: any) {
      ElMessage.error('查询失败：' + (e.message || '网络错误'))
    } finally {
      loading.value = false
    }
  }

  // 重置
  const handleReset = () => {
    searchForm.value = { customer: '', orderNo: '', pageType: '', surface: '', dateRange: null }
    currentPage.value = 1
    handleSearch()
  }

  // 选择变化
  const handleSelectionChange = (rows: OrderListItem[]) => {
    selectedIds.value = rows.map((r) => r.id)
  }

  // 加载订单到编辑页面
  const handleLoad = (row: OrderListItem) => {
    const routePath = pageTypeRouteMap[row.page_type]
    if (!routePath) {
      ElMessage.warning('未找到对应的款式页面：' + row.page_type)
      return
    }
    // 设置当前订单ID，页面加载时会从后端获取数据
    setCurrentOrderId(row.id)
    router.push({ path: routePath, query: { orderId: String(row.id) } })
  }

  // 查看详情
  const handleView = async (row: OrderListItem) => {
    try {
      const res = await getOrderDetail(row.id)
      detailData.value = res.data
      detailVisible.value = true
    } catch (e: any) {
      ElMessage.error('获取详情失败：' + (e.message || '网络错误'))
    }
  }

  // 编辑订单
  const handleEdit = async (row: OrderListItem) => {
    try {
      const res = await getOrderDetail(row.id)
      const detail = res.data
      editingId.value = row.id
      editForm.value = {
        customer: detail.customer || '',
        orderNo: detail.order_no || '',
        date: detail.date || '',
        surface: detail.surface || '',
        quantity: detail.quantity || '',
        length: detail.length || '',
        width: detail.width || '',
        height: detail.height || '',
        doorCount: detail.door_count || '',
        zhongCount: detail.zhong_count || '',
        remark: detail.remark || '',
        pageType: detail.page_type || '',
        tableData: detail.table_data || [],
        doorPanels: detail.door_panels || [],
        accessories: detail.accessories || [],
      }
      editVisible.value = true
    } catch (e: any) {
      ElMessage.error('获取订单数据失败：' + (e.message || '网络错误'))
    }
  }

  // 保存编辑
  const handleEditSave = async () => {
    editSaving.value = true
    try {
      await updateOrder(editingId.value, editForm.value)
      ElMessage.success('更新成功')
      editVisible.value = false
      handleSearch() // 刷新列表
    } catch (e: any) {
      ElMessage.error('更新失败：' + (e.message || '网络错误'))
    } finally {
      editSaving.value = false
    }
  }

  // 删除单个订单
  const handleDelete = async (row: OrderListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除客户 "${row.customer}" 的订单吗？`, '提示', {
        type: 'warning',
      })
      await deleteOrder(row.id)
      ElMessage.success('删除成功')
      handleSearch()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error('删除失败：' + (e.message || ''))
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条订单吗？`, '提示', {
        type: 'warning',
      })
      await batchDeleteOrders(selectedIds.value)
      ElMessage.success('批量删除成功')
      selectedIds.value = []
      handleSearch()
    } catch (e: any) {
      if (e !== 'cancel') {
        ElMessage.error('批量删除失败：' + (e.message || ''))
      }
    }
  }

  onMounted(() => {
    const hlId = route.query.highlightId
    if (hlId) {
      highlightId.value = Number(hlId)
    }
    handleSearch()

    // 返回后首次点击不取消高亮
    isFirstClickAfterReturn.value = true
    // 确保只添加一次监听器
    document.removeEventListener('click', handleDocumentClick)
    document.addEventListener('click', handleDocumentClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleDocumentClick)
  })

  // 点击事件处理 - 清除高亮
  const handleDocumentClick = () => {
    // 第一次点击（返回页面时自动触发的）不取消高亮
    if (isFirstClickAfterReturn.value) {
      isFirstClickAfterReturn.value = false
      return
    }
    highlightId.value = null
  }

  // 行高亮样式
  const getRowClassName = ({ row }: { row: OrderListItem }) => {
    if (highlightId.value && row.id === highlightId.value) {
      return 'highlight-row'
    }
    return ''
  }

  return {
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
  }
}
