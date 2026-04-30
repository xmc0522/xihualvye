import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

// 合法状态枚举
const VALID_STATUS = ['pending', 'producing', 'completed'] as const

// ============ 简单内存缓存（仅缓存统计接口，5秒 TTL）============
let statsCache: { data: any; expireAt: number } | null = null
let statusStatsCache: { data: any; expireAt: number } | null = null
const STATS_TTL = 5_000

function invalidateStatsCache() {
  statsCache = null
  statusStatsCache = null
}

// ============ 按型号统计订单数量 ============
router.get('/stats/by-page-type', (_req: Request, res: Response) => {
  try {
    if (statsCache && statsCache.expireAt > Date.now()) {
      res.json({ code: 0, data: statsCache.data })
      return
    }

    const rows = db.prepare(`
      SELECT page_type, COALESCE(SUM(CAST(quantity AS INTEGER)), 0) as total_quantity, COUNT(*) as order_count
      FROM orders
      WHERE page_type IS NOT NULL AND page_type != ''
      GROUP BY page_type
      ORDER BY total_quantity DESC
    `).all() as Array<{ page_type: string; total_quantity: number; order_count: number }>

    statsCache = { data: rows, expireAt: Date.now() + STATS_TTL }
    res.json({ code: 0, data: rows })
  } catch (e: any) {
    console.error('统计订单失败:', e)
    res.status(500).json({ code: -1, message: '统计失败: ' + e.message })
  }
})

// ============ 按状态统计订单数量 ============
router.get('/stats/by-status', (_req: Request, res: Response) => {
  try {
    if (statusStatsCache && statusStatsCache.expireAt > Date.now()) {
      res.json({ code: 0, data: statusStatsCache.data })
      return
    }

    const rows = db.prepare(`
      SELECT
        COALESCE(NULLIF(status, ''), 'pending') as status,
        COUNT(*) as order_count,
        COALESCE(SUM(CAST(quantity AS INTEGER)), 0) as total_quantity
      FROM orders
      GROUP BY COALESCE(NULLIF(status, ''), 'pending')
    `).all()

    statusStatsCache = { data: rows, expireAt: Date.now() + STATS_TTL }
    res.json({ code: 0, data: rows })
  } catch (e: any) {
    console.error('按状态统计失败:', e)
    res.status(500).json({ code: -1, message: '统计失败: ' + e.message })
  }
})

// ============ 创建订单 ============
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      customer = '',
      orderNo = '',
      date = '',
      surface = '',
      quantity = '',
      length = '',
      width = '',
      height = '',
      doorCount = '',
      zhongCount = '',
      remark = '',
      pageType = '',
      status = 'pending',
      tableData = [],
      doorPanels = [],
      accessories = [],
    } = req.body

    const safeStatus = VALID_STATUS.includes(status) ? status : 'pending'

    const stmt = db.prepare(`
      INSERT INTO orders (customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, status, table_data, door_panels, accessories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      customer,
      orderNo,
      date,
      surface,
      quantity,
      length,
      width,
      height,
      doorCount,
      zhongCount,
      remark,
      pageType,
      safeStatus,
      JSON.stringify(tableData),
      JSON.stringify(doorPanels),
      JSON.stringify(accessories)
    )

    invalidateStatsCache()
    res.json({
      code: 0,
      message: '保存成功',
      data: { id: result.lastInsertRowid },
    })
  } catch (e: any) {
    console.error('创建订单失败:', e)
    res.status(500).json({ code: -1, message: '保存失败: ' + e.message })
  }
})

// ============ 查询订单列表 ============
router.get('/', (req: Request, res: Response) => {
  try {
    const { customer, pageType, orderNo, surface, status, startDate, endDate, page = '1', pageSize = '20' } = req.query

    let sql = 'SELECT id, customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, status, created_at, updated_at FROM orders WHERE 1=1'
    const params: any[] = []

    if (customer) {
      sql += ' AND customer LIKE ?'
      params.push(`%${customer}%`)
    }
    if (pageType) {
      sql += ' AND page_type LIKE ?'
      params.push(`%${pageType}%`)
    }
    if (orderNo) {
      sql += ' AND order_no LIKE ?'
      params.push(`%${orderNo}%`)
    }
    if (surface) {
      sql += ' AND surface = ?'
      params.push(surface)
    }
    if (status) {
      sql += ` AND COALESCE(NULLIF(status, ''), 'pending') = ?`
      params.push(status)
    }
    if (startDate) {
      sql += ' AND date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND date <= ?'
      params.push(endDate)
    }

    // 先查总数
    const countSql = sql.replace(
      'SELECT id, customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, status, created_at, updated_at',
      'SELECT COUNT(*) as total'
    )
    const countResult = db.prepare(countSql).get(...params) as { total: number }
    const total = countResult.total

    // 分页
    const p = Math.max(1, parseInt(page as string))
    const ps = Math.max(1, Math.min(100, parseInt(pageSize as string)))
    sql += ' ORDER BY date DESC, updated_at DESC LIMIT ? OFFSET ?'
    params.push(ps, (p - 1) * ps)

    const rows = db.prepare(sql).all(...params)

    res.json({
      code: 0,
      data: { list: rows, total, page: p, pageSize: ps },
    })
  } catch (e: any) {
    console.error('查询订单列表失败:', e)
    res.status(500).json({ code: -1, message: '查询失败: ' + e.message })
  }
})

// ============ 获取单个订单详情 ============
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any

    if (!row) {
      res.status(404).json({ code: -1, message: '订单不存在' })
      return
    }

    row.table_data = JSON.parse(row.table_data || '[]')
    row.door_panels = JSON.parse(row.door_panels || '[]')
    row.accessories = JSON.parse(row.accessories || '[]')
    if (!row.status) row.status = 'pending'

    res.json({ code: 0, data: row })
  } catch (e: any) {
    console.error('获取订单详情失败:', e)
    res.status(500).json({ code: -1, message: '获取失败: ' + e.message })
  }
})

// ============ 更新订单 ============
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      customer,
      orderNo,
      date,
      surface,
      quantity,
      length,
      width,
      height,
      doorCount,
      zhongCount,
      remark,
      pageType,
      status,
      tableData,
      doorPanels,
      accessories,
    } = req.body

    const existing = db.prepare('SELECT id, status FROM orders WHERE id = ?').get(id) as any
    if (!existing) {
      res.status(404).json({ code: -1, message: '订单不存在' })
      return
    }

    // 若请求未传 status，保留原值；否则校验合法性
    const newStatus = status === undefined
      ? (existing.status || 'pending')
      : (VALID_STATUS.includes(status) ? status : 'pending')

    const stmt = db.prepare(`
      UPDATE orders SET
        customer = ?,
        order_no = ?,
        date = ?,
        surface = ?,
        quantity = ?,
        length = ?,
        width = ?,
        height = ?,
        door_count = ?,
        zhong_count = ?,
        remark = ?,
        page_type = ?,
        status = ?,
        table_data = ?,
        door_panels = ?,
        accessories = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `)

    stmt.run(
      customer ?? '',
      orderNo ?? '',
      date ?? '',
      surface ?? '',
      quantity ?? '',
      length ?? '',
      width ?? '',
      height ?? '',
      doorCount ?? '',
      zhongCount ?? '',
      remark ?? '',
      pageType ?? '',
      newStatus,
      JSON.stringify(tableData ?? []),
      JSON.stringify(doorPanels ?? []),
      JSON.stringify(accessories ?? []),
      id
    )

    invalidateStatsCache()
    res.json({ code: 0, message: '更新成功' })
  } catch (e: any) {
    console.error('更新订单失败:', e)
    res.status(500).json({ code: -1, message: '更新失败: ' + e.message })
  }
})

// ============ 仅更新订单状态（轻量） ============
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!VALID_STATUS.includes(status)) {
      res.status(400).json({ code: -1, message: '无效的状态值' })
      return
    }

    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
    if (!existing) {
      res.status(404).json({ code: -1, message: '订单不存在' })
      return
    }

    db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`)
      .run(status, id)

    invalidateStatsCache()
    res.json({ code: 0, message: '状态已更新' })
  } catch (e: any) {
    console.error('更新订单状态失败:', e)
    res.status(500).json({ code: -1, message: '更新失败: ' + e.message })
  }
})

// ============ 删除订单 ============
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
    if (!existing) {
      res.status(404).json({ code: -1, message: '订单不存在' })
      return
    }

    db.prepare('DELETE FROM orders WHERE id = ?').run(id)

    invalidateStatsCache()
    res.json({ code: 0, message: '删除成功' })
  } catch (e: any) {
    console.error('删除订单失败:', e)
    res.status(500).json({ code: -1, message: '删除失败: ' + e.message })
  }
})

// ============ 批量删除订单 ============
router.post('/batch-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ code: -1, message: '请提供要删除的订单ID列表' })
      return
    }

    const placeholders = ids.map(() => '?').join(',')
    const stmt = db.prepare(`DELETE FROM orders WHERE id IN (${placeholders})`)
    const result = stmt.run(...ids)

    invalidateStatsCache()
    res.json({
      code: 0,
      message: `成功删除 ${result.changes} 条订单`,
    })
  } catch (e: any) {
    console.error('批量删除失败:', e)
    res.status(500).json({ code: -1, message: '批量删除失败: ' + e.message })
  }
})

export default router
