/**
 * 数据库定时备份
 * - 每天凌晨 02:00 自动备份 xihualvye.db 到 data/backup/YYYY-MM-DD.db
 * - 自动清理超过 RETAIN_DAYS 天的旧备份
 * - 启动时若当天还没备份，立即备份一次
 *
 * 备份原理：使用 SQLite 的 VACUUM INTO（原子操作，不阻塞读写）
 */
import path from 'path'
import fs from 'fs'
import db from './db'

const DEFAULT_DATA_DIR = path.join(__dirname, '..', 'data')
const dataDir = process.env.DB_DIR || DEFAULT_DATA_DIR
const backupDir = path.join(dataDir, 'backup')
const RETAIN_DAYS = Number(process.env.BACKUP_RETAIN_DAYS) || 30
const BACKUP_HOUR = 2 // 凌晨 2 点

function ensureBackupDir() {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }
}

function todayStr(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** 执行一次备份（幂等：当天已存在就跳过） */
export function backupOnce(): void {
  try {
    ensureBackupDir()
    const target = path.join(backupDir, `${todayStr()}.db`)
    if (fs.existsSync(target)) {
      // 当天已备份，跳过
      return
    }
    // VACUUM INTO 是 SQLite 3.27+ 提供的原子备份命令（不影响在线读写）
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`)
    const size = fs.statSync(target).size
    console.log(`💾 数据库已备份: ${target} (${(size / 1024).toFixed(1)} KB)`)

    // 清理过期备份
    cleanupOldBackups()
  } catch (e) {
    console.error('❌ 数据库备份失败:', e)
  }
}

/** 清理超过 RETAIN_DAYS 天的旧备份 */
function cleanupOldBackups(): void {
  try {
    const files = fs.readdirSync(backupDir).filter((f) => /^\d{4}-\d{2}-\d{2}\.db$/.test(f))
    const cutoff = Date.now() - RETAIN_DAYS * 24 * 60 * 60 * 1000

    let removed = 0
    for (const f of files) {
      const p = path.join(backupDir, f)
      const stat = fs.statSync(p)
      if (stat.mtimeMs < cutoff) {
        fs.unlinkSync(p)
        removed++
      }
    }
    if (removed > 0) {
      console.log(`🧹 已清理 ${removed} 个过期备份（保留近 ${RETAIN_DAYS} 天）`)
    }
  } catch (e) {
    console.warn('清理旧备份时出现警告:', e)
  }
}

/** 计算到下一次目标小时（默认凌晨 2 点）的毫秒数 */
function msUntilNextRun(targetHour: number): number {
  const now = new Date()
  const next = new Date(now)
  next.setHours(targetHour, 0, 0, 0)
  if (next.getTime() <= now.getTime()) {
    // 今天的目标点已过，跳到明天
    next.setDate(next.getDate() + 1)
  }
  return next.getTime() - now.getTime()
}

/** 启动定时任务 */
export function startBackupSchedule(): void {
  ensureBackupDir()

  // 启动时立即检查一次（如果今天还没备份就立即做）
  setTimeout(backupOnce, 5_000)

  // 安排首次定时
  function schedule() {
    const delay = msUntilNextRun(BACKUP_HOUR)
    setTimeout(() => {
      backupOnce()
      // 之后每 24 小时一次
      setInterval(backupOnce, 24 * 60 * 60 * 1000)
    }, delay)

    const hours = (delay / 1000 / 60 / 60).toFixed(2)
    console.log(`⏰ 下次自动备份将在 ${hours} 小时后执行（每天 ${BACKUP_HOUR}:00）`)
  }

  schedule()
}
