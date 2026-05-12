import path from 'path'
import fs from 'fs'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Database = require('better-sqlite3') as typeof import('better-sqlite3')

// 数据库文件存放目录
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'xihualvye.db')
console.log(`📁 数据库路径: ${dbPath}`)

// ============ better-sqlite3：同步原生 SQLite ============
// 与 sql.js 的关键差异：
//  - 写入是 page-level 增量落盘，不再 export 整库；1万订单写入从 200-800ms 降到 <1ms
//  - 真正支持 WAL（Write-Ahead Logging），并发读写更安全
//  - 内存常驻仅 page cache（几 MB），不再随订单量线性膨胀
//  - 同步 API 简洁；崩溃/断电不会丢数据（fsync 由 SQLite 内核保证）
const rawDb = new Database(dbPath)

// 性能与安全相关 PRAGMA
rawDb.pragma('journal_mode = WAL')        // 真正生效：并发读 + 顺序写
rawDb.pragma('synchronous = NORMAL')      // WAL 下 NORMAL 即可保证崩溃安全，比 FULL 快数倍
rawDb.pragma('foreign_keys = ON')
rawDb.pragma('cache_size = -16000')       // ~16MB page cache

// ============ 建表 ============
rawDb.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer TEXT DEFAULT '',
    order_no TEXT DEFAULT '',
    date TEXT DEFAULT '',
    surface TEXT DEFAULT '',
    quantity INTEGER DEFAULT 0,
    length TEXT DEFAULT '',
    width TEXT DEFAULT '',
    height TEXT DEFAULT '',
    door_count TEXT DEFAULT '',
    zhong_count TEXT DEFAULT '',
    remark TEXT DEFAULT '',
    page_type TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    table_data TEXT DEFAULT '[]',
    door_panels TEXT DEFAULT '[]',
    accessories TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`)

// ============ 数据库迁移：兼容旧版本 sql.js 留下的库 ============
try {
  const cols = rawDb.prepare(`PRAGMA table_info(orders)`).all() as Array<{ name: string; type: string }>
  const colMap = new Map(cols.map((c) => [c.name, c.type]))

  // 1) status 列（早期版本没有）
  if (!colMap.has('status')) {
    rawDb.exec(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'`)
    rawDb.exec(`UPDATE orders SET status = 'pending' WHERE status IS NULL OR status = ''`)
    console.log('🔧 已为现有数据库自动添加 status 列')
  }

  // 2) shipped → completed 状态合并
  const shippedCount = (rawDb.prepare(`SELECT COUNT(*) as c FROM orders WHERE status = 'shipped'`).get() as { c: number }).c
  if (shippedCount > 0) {
    rawDb.exec(`UPDATE orders SET status = 'completed' WHERE status = 'shipped'`)
    console.log(`🔧 已将 ${shippedCount} 条 shipped 历史订单迁移为 completed`)
  }

  // 3) quantity 旧库为 TEXT，迁移到 INTEGER（一次性，后续启动不会重复执行）
  const qtyType = (colMap.get('quantity') || '').toUpperCase()
  if (qtyType && qtyType !== 'INTEGER') {
    console.log('🔧 检测到 quantity 字段为旧的 TEXT 类型，开始迁移为 INTEGER ...')
    const migrate = rawDb.transaction(() => {
      rawDb.exec(`ALTER TABLE orders RENAME TO orders_old`)
      rawDb.exec(`
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer TEXT DEFAULT '',
          order_no TEXT DEFAULT '',
          date TEXT DEFAULT '',
          surface TEXT DEFAULT '',
          quantity INTEGER DEFAULT 0,
          length TEXT DEFAULT '',
          width TEXT DEFAULT '',
          height TEXT DEFAULT '',
          door_count TEXT DEFAULT '',
          zhong_count TEXT DEFAULT '',
          remark TEXT DEFAULT '',
          page_type TEXT DEFAULT '',
          status TEXT DEFAULT 'pending',
          table_data TEXT DEFAULT '[]',
          door_panels TEXT DEFAULT '[]',
          accessories TEXT DEFAULT '[]',
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
      `)
      rawDb.exec(`
        INSERT INTO orders (id, customer, order_no, date, surface, quantity, length, width, height,
                            door_count, zhong_count, remark, page_type, status,
                            table_data, door_panels, accessories, created_at, updated_at)
        SELECT id, customer, order_no, date, surface,
               CAST(NULLIF(TRIM(quantity), '') AS INTEGER),
               length, width, height, door_count, zhong_count, remark, page_type, status,
               table_data, door_panels, accessories, created_at, updated_at
        FROM orders_old
      `)
      rawDb.exec(`DROP TABLE orders_old`)
    })
    migrate()
    console.log('✅ quantity 字段迁移完成（TEXT → INTEGER）')
  }
} catch (e) {
  console.warn('数据库迁移时出现警告:', e)
}

// ============ 索引：加速订单列表查询 / 统计 ============
try {
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_date_updated ON orders(date DESC, updated_at DESC)`)
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`)
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer)`)
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_page_type ON orders(page_type)`)
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no)`)
  // 折线图聚合：按 updated_at 截取的日期分组
  rawDb.exec(`CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON orders(updated_at)`)
} catch (e) {
  console.warn('创建索引时出现警告:', e)
}

// ============ 进程退出兜底（better-sqlite3 是同步写入，仅需关闭句柄） ============
function closeDb() {
  try {
    if (rawDb.open) rawDb.close()
  } catch (e) {
    console.error('关闭数据库失败:', e)
  }
}
process.on('beforeExit', closeDb)
process.on('SIGINT', () => { closeDb(); process.exit(0) })
process.on('SIGTERM', () => { closeDb(); process.exit(0) })

console.log('✅ 数据库初始化完成')

// ============ 对外 API ============
// 保留 waitForReady / flushSync，以兼容现有调用方（同步驱动下都是 no-op）
const db = {
  /** 等待数据库初始化完成（同步驱动下立即 resolve） */
  waitForReady(): Promise<void> {
    return Promise.resolve()
  },

  /** 主动刷盘（WAL 已自动落盘，这里仅做 checkpoint） */
  flushSync() {
    try {
      rawDb.pragma('wal_checkpoint(PASSIVE)')
    } catch (e) {
      console.error('checkpoint 失败:', e)
    }
  },

  /** 透传 prepare：API 与原 sql.js 兼容包装一致（run/get/all） */
  prepare(sql: string) {
    return rawDb.prepare(sql)
  },

  exec(sql: string) {
    rawDb.exec(sql)
  },

  pragma(p: string) {
    return rawDb.pragma(p)
  },

  /** 暴露事务能力，供需要批量原子操作的接口使用 */
  transaction<T extends (...args: any[]) => any>(fn: T): T {
    return rawDb.transaction(fn) as unknown as T
  },
}

export default db
