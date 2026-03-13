import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 数据库文件存放目录，可通过环境变量 DB_DIR 自定义
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'xihualvye.db')
console.log(`📁 数据库路径: ${dbPath}`)
const db = new Database(dbPath)

// 启用 WAL 模式，提高并发性能
db.pragma('journal_mode = WAL')

// 创建订单表
db.exec(`
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

export default db
