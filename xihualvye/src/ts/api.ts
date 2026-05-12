/**
 * 前端 API 请求封装
 * 所有后端接口都通过这个模块调用
 */

import { ElMessage } from 'element-plus'

const BASE_URL = '/api'
const TOKEN_KEY = 'xhly_token'

// 获取当前登录信息
function getAuthInfo() {
  const saved = localStorage.getItem('xhly_auth')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

// Token 存取
export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || ''
}
export function setToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// 强制退出登录
function forceLogout() {
  localStorage.removeItem('xhly_auth')
  clearToken()
  ElMessage.error('登录已过期，请重新登录')
  // 延迟跳转，确保消息显示
  setTimeout(() => {
    window.location.href = '/login'
  }, 1000)
}

// 通用请求方法
async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  // 组装验证请求头：优先使用 token，未登录过新版接口时向后兼容账密
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (!url.includes('/auth/login')) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      // 向后兼容：老客户端未拿到 token，以账密鉴权作为过渡
      const auth = getAuthInfo()
      if (auth?.username && auth?.password) {
        headers['x-username'] = auth.username
        headers['x-password'] = auth.password
      } else {
        forceLogout()
        throw new Error('认证失败')
      }
    }
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })

  // 401 统一处理
  if (res.status === 401) {
    forceLogout()
    throw new Error('认证失败，请重新登录')
  }

  const data = await res.json()
  if (data?.code === 401) {
    forceLogout()
    throw new Error('认证失败，请重新登录')
  }

  if (!res.ok) {
    throw new Error(data?.message || `请求失败 (${res.status})`)
  }

  return data
}

// ============ 认证相关接口 ============

/** 登录（拿到 token 并存入 localStorage） */
export async function login(username: string, password: string) {
  const res = await request<{
    code: number
    message: string
    data?: { token: string; expiresAt: number }
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  if (res.code === 0 && res.data?.token) {
    setToken(res.data.token)
  }
  return res
}
// ============ 订单相关接口 ============

/** 订单状态枚举 */
export type OrderStatus = 'pending' | 'producing' | 'completed'

/** 订单状态显示配置（中文标签 + 颜色） */
export const ORDER_STATUS_OPTIONS: Array<{
  value: OrderStatus
  label: string
  color: 'info' | 'warning' | 'primary' | 'success' | 'danger'
}> = [
  { value: 'pending', label: '待生产', color: 'info' },
  { value: 'producing', label: '生产中', color: 'warning' },
  { value: 'completed', label: '已完成', color: 'success' },
]

export interface OrderInfo {
  customer: string
  orderNo: string
  date: string
  surface: string
  quantity: string
  length: string
  width: string
  height: string
  doorCount: string
  zhongCount: string
  remark: string
}

export interface OrderSavePayload {
  customer: string
  orderNo: string
  date: string
  surface: string
  quantity: string
  length: string
  width: string
  height: string
  doorCount: string
  zhongCount: string
  remark: string
  pageType: string
  status?: OrderStatus
  tableData: Array<{ mingcheng: string; guige: string; shuliang: string; beizhu: string }>
  doorPanels: Array<{
    name: string
    shuju1: string
    shuju2: string
    shuliang: string
    beizhu: string
  }>
  accessories: Array<{ name: string; value: string }>
}

export interface OrderListItem {
  id: number
  customer: string
  order_no: string
  date: string
  surface: string
  quantity: string
  length: string
  width: string
  height: string
  door_count: string
  zhong_count: string
  remark: string
  page_type: string
  status: OrderStatus
  created_at: string
  updated_at: string
}

export interface OrderDetail extends OrderListItem {
  table_data: Array<{ mingcheng: string; guige: string; shuliang: string; beizhu: string }>
  door_panels: Array<{
    name: string
    shuju1: string
    shuju2: string
    shuliang: string
    beizhu: string
  }>
  accessories: Array<{ name: string; value: string }>
}

export interface OrderListResponse {
  list: OrderListItem[]
  total: number
  page: number
  pageSize: number
}

/** 保存订单（新建） */
export async function createOrder(payload: OrderSavePayload) {
  return request<{ code: number; message: string; data: { id: number } }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** 查询订单列表 */
export async function getOrderList(
  params: {
    customer?: string
    pageType?: string
    orderNo?: string
    surface?: string
    status?: OrderStatus | ''
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  } = {},
) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })
  const query = searchParams.toString()
  return request<{ code: number; data: OrderListResponse }>(`/orders${query ? '?' + query : ''}`)
}

/** 仅更新订单状态（轻量接口） */
export async function updateOrderStatus(id: number, status: OrderStatus) {
  return request<{ code: number; message: string }>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

/** 获取订单详情 */
export async function getOrderDetail(id: number) {
  return request<{ code: number; data: OrderDetail }>(`/orders/${id}`)
}

/** 更新订单 */
export async function updateOrder(id: number, payload: OrderSavePayload) {
  return request<{ code: number; message: string }>(`/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** 删除订单 */
export async function deleteOrder(id: number) {
  return request<{ code: number; message: string }>(`/orders/${id}`, {
    method: 'DELETE',
  })
}

/** 批量删除订单 */
export async function batchDeleteOrders(ids: number[]) {
  return request<{ code: number; message: string }>('/orders/batch-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

// ============ 统计相关接口 ============

export interface PageTypeStats {
  page_type: string
  total_quantity: number
  order_count: number
}

/** 按型号统计订单数量 */
export async function getOrderStatsByPageType() {
  return request<{ code: number; data: PageTypeStats[] }>('/orders/stats/by-page-type')
}

// ============ Dashboard 一站式聚合 ============

export interface DashboardStats {
  totalOrders: number
  totalQuantity: number
  todayOrders: number
  monthOrders: number
  statusCounts: { pending: number; producing: number; completed: number }
  categoryQuantity: Record<string, number>  // { '天枢款': 12, ... }
  dailyTrend: Array<{ date: string; count: number }>  // YYYY/MM/DD
  recentOrders: OrderListItem[]
}

/** 获取 Dashboard 一站式聚合数据（SQL 层计算，1万订单也仅需几毫秒） */
export async function getDashboardStats(days: 7 | 30 = 7) {
  return request<{ code: number; data: DashboardStats }>(`/orders/stats/dashboard?days=${days}`)
}
