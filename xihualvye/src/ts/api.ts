/**
 * 前端 API 请求封装
 * 所有后端接口都通过这个模块调用
 */

import { ElMessage } from 'element-plus'

const BASE_URL = '/api'

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

// 强制退出登录
function forceLogout() {
  localStorage.removeItem('xhly_auth')
  ElMessage.error('密码已更改，请重新登录')
  // 延迟跳转，确保消息显示
  setTimeout(() => {
    window.location.href = '/login'
  }, 1000)
}

// 验证当前登录凭据是否有效
async function verifyAuth(): Promise<boolean> {
  const auth = getAuthInfo()
  if (!auth || !auth.username || !auth.password) {
    return false
  }

  try {
    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: auth.username,
        password: auth.password,
      }),
    })

    if (res.status === 401) {
      forceLogout()
      return false
    }

    const data = await res.json()
    return data.code === 0
  } catch {
    return false
  }
}

// 通用请求方法
async function request<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  // 在每次请求前验证认证信息（除了登录接口）
  if (!url.includes('/auth/login')) {
    const isValid = await verifyAuth()
    if (!isValid) {
      throw new Error('认证失败')
    }
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json()

  // 检查是否返回401认证失败
  if (res.status === 401 || data.code === 401) {
    forceLogout()
    throw new Error('认证失败，请重新登录')
  }

  if (!res.ok) {
    throw new Error(data.message || `请求失败 (${res.status})`)
  }

  return data
}

// ============ 订单相关接口 ============

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
