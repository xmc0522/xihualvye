import { Router, Request, Response } from 'express'
import db from '../db'

const router = Router()

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
      tableData = [],
      doorPanels = [],
      accessories = [],
    } = req.body

    const stmt = db.prepare(`
      INSERT INTO orders (customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, table_data, door_panels, accessories)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      JSON.stringify(tableData),
      JSON.stringify(doorPanels),
      JSON.stringify(accessories)
    )

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
    const { customer, pageType, orderNo, startDate, endDate, page = '1', pageSize = '20' } = req.query

    let sql = 'SELECT id, customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, created_at, updated_at FROM orders WHERE 1=1'
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
    if (startDate) {
      sql += ' AND date >= ?'
      params.push(startDate)
    }
    if (endDate) {
      sql += ' AND date <= ?'
      params.push(endDate)
    }

    // 先查总数
    const countSql = sql.replace('SELECT id, customer, order_no, date, surface, quantity, length, width, height, door_count, zhong_count, remark, page_type, created_at, updated_at', 'SELECT COUNT(*) as total')
    const countResult = db.prepare(countSql).get(...params) as { total: number }
    const total = countResult.total

    // 分页
    const p = Math.max(1, parseInt(page as string))
    const ps = Math.max(1, Math.min(100, parseInt(pageSize as string)))
    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?'
    params.push(ps, (p - 1) * ps)

    const rows = db.prepare(sql).all(...params)

    res.json({
      code: 0,
      data: {
        list: rows,
        total,
        page: p,
        pageSize: ps,
      },
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

    // 解析 JSON 字段
    row.table_data = JSON.parse(row.table_data || '[]')
    row.door_panels = JSON.parse(row.door_panels || '[]')
    row.accessories = JSON.parse(row.accessories || '[]')

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
      tableData,
      doorPanels,
      accessories,
    } = req.body

    // 检查订单是否存在
    const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
    if (!existing) {
      res.status(404).json({ code: -1, message: '订单不存在' })
      return
    }

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
      JSON.stringify(tableData ?? []),
      JSON.stringify(doorPanels ?? []),
      JSON.stringify(accessories ?? []),
      id
    )

    res.json({ code: 0, message: '更新成功' })
  } catch (e: any) {
    console.error('更新订单失败:', e)
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
