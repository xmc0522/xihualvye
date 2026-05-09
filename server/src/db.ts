import path from 'path'
import fs from 'fs'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const initSqlJs = require('sql.js')

// 数据库文件存放目录
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'xihualvye.db')
console.log(`📁 数据库路径: ${dbPath}`)

let rawDb: any = null
let dbReady = false
const readyCallbacks: Array<() => void> = []

// ============ 异步 + debounce 写盘机制 ============
// sql.js 的局限：每次写入都需要 export 整库 -> 写文件。
// 之前的 saveToFile 是同步写盘，订单批量操作时延迟很高。
// 这里改为：所有写操作只标记 dirty，由一个 debounce 定时器（默认 200ms）合并后异步写入。
const SAVE_DEBOUNCE_MS = 200
let saveTimer: NodeJS.Timeout | null = null
let saving = false        // 防止并发写
let pendingSave = false   // 上次 debounce 期间又来了新写入
let dirty = false         // 是否有未持久化的修改

function flushToFile(): Promise<void> {
  return new Promise((resolve) => {
    if (!rawDb || !dirty) {
      resolve()
      return
    }
    if (saving) {
      // 正在写盘，标记一下，写完后再触发一次
      pendingSave = true
      resolve()
      return
    }
    saving = true
    dirty = false
    try {
      const data = rawDb.export()
      const buffer = Buffer.from(data)
      // 异步写盘：先写到 tmp 文件，再 rename，避免半写状态损坏数据库
      const tmpPath = dbPath + '.tmp'
      fs.writeFile(tmpPath, buffer, (err) => {
        if (err) {
          console.error('❌ 数据库写盘失败:', err)
          dirty = true // 写失败，标记为脏，下次重试
          saving = false
          resolve()
          return
        }
        fs.rename(tmpPath, dbPath, (renameErr) => {
          saving = false
          if (renameErr) {
            console.error('❌ 数据库 rename 失败:', renameErr)
            dirty = true
          }
          // 写盘期间又有新写入，立刻再 flush 一次
          if (pendingSave) {
            pendingSave = false
            scheduleSave()
          }
          resolve()
        })
      })
    } catch (e) {
      saving = false
      dirty = true
      console.error('❌ 数据库导出失败:', e)
      resolve()
    }
  })
}

// 调度一次 debounce 写盘（多次调用会被合并）
function scheduleSave() {
  if (!rawDb) return
  dirty = true
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    void flushToFile()
  }, SAVE_DEBOUNCE_MS)
}

// 同步等待写盘（用于进程退出前）
function flushSync() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (!rawDb || !dirty) return
  try {
    const data = rawDb.export()
    fs.writeFileSync(dbPath, Buffer.from(data))
    dirty = false
  } catch (e) {
    console.error('❌ 数据库同步写盘失败:', e)
  }
}

// 进程退出前兜底：把脏数据落盘，避免丢失最后一批写入
process.on('beforeExit', () => flushSync())
process.on('SIGINT', () => {
  flushSync()
  process.exit(0)
})
process.on('SIGTERM', () => {
  flushSync()
  process.exit(0)
})

// 异步初始化
async function initDatabase() {
  const SQL = await initSqlJs()

  let buffer: Buffer | undefined
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath)
  }

  rawDb = new SQL.Database(buffer)

  // 启用 WAL 模式
  rawDb.run('PRAGMA journal_mode = WAL')

  // 创建订单表
  rawDb.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer TEXT DEFAULT '',
      order_no TEXT DEFAULT '',
      date TEXT DEFAULT '',
      surface TEXT DEFAULT '',
      quantity TEXT DEFAULT '',
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

  // 兼容已存在的旧库：尝试增加 status 列（已存在时忽略错误）
  try {
    const existCols = rawDb.exec(`PRAGMA table_info(orders)`)
    const cols: string[] = (existCols[0]?.values || []).map((r: any[]) => r[1])
    if (!cols.includes('status')) {
      rawDb.run(`ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending'`)
      // 已存在的历史记录默认置为 pending
      rawDb.run(`UPDATE orders SET status = 'pending' WHERE status IS NULL OR status = ''`)
      console.log('🔧 已为现有数据库自动添加 status 列')
    }

    // 数据迁移：移除已废弃的 shipped 状态，统一改为 completed
    const shippedCheck = rawDb.exec(`SELECT COUNT(*) FROM orders WHERE status = 'shipped'`)
    const shippedCount = shippedCheck[0]?.values[0]?.[0] as number | undefined
    if (shippedCount && shippedCount > 0) {
      rawDb.run(`UPDATE orders SET status = 'completed' WHERE status = 'shipped'`)
      console.log(`🔧 已将 ${shippedCount} 条 shipped 历史订单迁移为 completed`)
    }
  } catch (e) {
    console.warn('迁移 status 列时出现警告:', e)
  }

  // ============ 索引：加速订单列表查询/统计 ============
  // 1) 列表默认 ORDER BY date DESC, updated_at DESC
  // 2) 状态筛选 / 状态统计
  // 3) 客户、款式、单号 LIKE 查询（前缀有效）
  try {
    rawDb.run(`CREATE INDEX IF NOT EXISTS idx_orders_date_updated ON orders(date DESC, updated_at DESC)`)
    rawDb.run(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`)
    rawDb.run(`CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer)`)
    rawDb.run(`CREATE INDEX IF NOT EXISTS idx_orders_page_type ON orders(page_type)`)
    rawDb.run(`CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no)`)
  } catch (e) {
    console.warn('创建索引时出现警告:', e)
  }

  // 初始化阶段同步落盘一次（保证 schema/索引立即生效）
  dirty = true
  flushSync()

  dbReady = true
  readyCallbacks.forEach((cb) => cb())
  readyCallbacks.length = 0
  console.log('✅ 数据库初始化完成')
}

// 等待数据库就绪
function waitForReady(): Promise<void> {
  if (dbReady) return Promise.resolve()
  return new Promise((resolve) => {
    readyCallbacks.push(resolve)
  })
}

// 提供与 better-sqlite3 兼容的 API
const db = {
  /** 等待数据库初始化完成 */
  waitForReady,

  /** 主动 flush（同步），用于热备份等场景 */
  flushSync,

  prepare(sql: string) {
    return {
      run(...params: any[]) {
        rawDb.run(sql, params)
        scheduleSave()
        const lastId = rawDb.exec('SELECT last_insert_rowid() as id')
        const changesResult = rawDb.exec('SELECT changes() as c')
        return {
          lastInsertRowid: lastId[0]?.values[0]?.[0] ?? 0,
          changes: changesResult[0]?.values[0]?.[0] ?? 0,
        }
      },
      get(...params: any[]) {
        const stmt = rawDb.prepare(sql)
        stmt.bind(params)
        if (stmt.step()) {
          const columns = stmt.getColumnNames()
          const values = stmt.get()
          stmt.free()
          const row: any = {}
          columns.forEach((col: string, i: number) => {
            row[col] = values[i]
          })
          return row
        }
        stmt.free()
        return undefined
      },
      all(...params: any[]) {
        const results = rawDb.exec(sql, params)
        if (results.length === 0) return []
        const { columns, values } = results[0]
        return values.map((row: any[]) => {
          const obj: any = {}
          columns.forEach((col: string, i: number) => {
            obj[col] = row[i]
          })
          return obj
        })
      },
    }
  },
  exec(sql: string) {
    rawDb.run(sql)
    scheduleSave()
  },
  pragma(pragmaStr: string) {
    rawDb.run(`PRAGMA ${pragmaStr}`)
  },
}

// 启动初始化
initDatabase().catch((err) => {
  console.error('❌ 数据库初始化失败:', err)
  process.exit(1)
})

export default db
