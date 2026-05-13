/**
 * 轻量日志模块（无外部依赖）
 *
 * 功能：
 *   - 按级别输出（debug/info/warn/error）
 *   - 同时输出到控制台（PM2 会接管）和按日期分割的文件
 *   - 自动清理超过 LOG_RETAIN_DAYS 天的旧日志
 *   - 错误日志单独写入 error.YYYY-MM-DD.log
 *
 * 用法：
 *   import { logger } from './logger'
 *   logger.info('订单创建', { orderId: 123 })
 *   logger.error('数据库失败', err)
 */
import path from 'path'
import fs from 'fs'

const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '..', 'logs')
const LOG_RETAIN_DAYS = Number(process.env.LOG_RETAIN_DAYS) || 30

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_COLOR: Record<Level, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
}
const RESET = '\x1b[0m'

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function nowStr(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (a instanceof Error) return `${a.message}\n${a.stack || ''}`
      if (typeof a === 'object') {
        try {
          return JSON.stringify(a)
        } catch {
          return String(a)
        }
      }
      return String(a)
    })
    .join(' ')
}

function writeFile(level: Level, line: string) {
  try {
    const date = todayStr()
    fs.appendFileSync(path.join(LOG_DIR, `app.${date}.log`), line + '\n')
    if (level === 'error') {
      fs.appendFileSync(path.join(LOG_DIR, `error.${date}.log`), line + '\n')
    }
  } catch {
    // 日志写入失败不影响业务
  }
}

function log(level: Level, ...args: unknown[]) {
  const ts = nowStr()
  const msg = formatArgs(args)
  const line = `[${ts}] [${level.toUpperCase()}] ${msg}`

  // 控制台带色彩
  const color = LEVEL_COLOR[level]
  if (level === 'error') {
    console.error(`${color}${line}${RESET}`)
  } else if (level === 'warn') {
    console.warn(`${color}${line}${RESET}`)
  } else {
    console.log(`${color}${line}${RESET}`)
  }

  // 文件
  writeFile(level, line)
}

/** 清理过期日志 */
function cleanupOldLogs(): void {
  try {
    const files = fs.readdirSync(LOG_DIR).filter((f) => /^(app|error)\.\d{4}-\d{2}-\d{2}\.log$/.test(f))
    const cutoff = Date.now() - LOG_RETAIN_DAYS * 24 * 60 * 60 * 1000
    for (const f of files) {
      const p = path.join(LOG_DIR, f)
      const stat = fs.statSync(p)
      if (stat.mtimeMs < cutoff) fs.unlinkSync(p)
    }
  } catch {
    // 忽略
  }
}

// 启动时清理一次
cleanupOldLogs()
// 每 24 小时清理一次
setInterval(cleanupOldLogs, 24 * 60 * 60 * 1000)

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
}
