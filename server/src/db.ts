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

// 保存数据库到文件
function saveToFile() {
  if (!rawDb) return
  const data = rawDb.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

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
      table_data TEXT DEFAULT '[]',
      door_panels TEXT DEFAULT '[]',
      accessories TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `)
  saveToFile()

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

  prepare(sql: string) {
    return {
      run(...params: any[]) {
        rawDb.run(sql, params)
        saveToFile()
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
    saveToFile()
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
