import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import db from './db'
import ordersRouter from './routes/orders'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3456

// 中间件
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// API 路由（需要鉴权）
app.use('/api/orders', authGuard, ordersRouter)

// 登录接口
// 优先从环境变量读取（生产环境强烈推荐），未配置则使用默认值
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'xhly'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123123'

if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  未设置 ADMIN_PASSWORD 环境变量，正在使用默认密码（不安全）！')
  console.warn('   生产部署请通过 PM2 ecosystem 文件或启动命令设置，例如：')
  console.warn('   ADMIN_USERNAME=admin ADMIN_PASSWORD=YourStrongPwd pm2 start dist/index.js --name xihualvye --update-env')
}

// ============ Token 认证（轻量化 JWT风格）============
// 以前的做法：前端每次请求都调 /auth/verify 验证账密，QPS 减半、延迟翻倍。
// 现在：登录成功后返回 token，后续请求只需验证 token，且服务端用 Map 缓存。
// token 格式：base64(payload).hmacSha256，payload = { u: username, exp: 过期时间戳 }
const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  // 未配置时使用进程内随机密钥（重启后旧 token 会失效，这是预期行为）
  crypto.randomBytes(32).toString('hex')
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 天

function signToken(username: string): string {
  const payload = { u: username, exp: Date.now() + TOKEN_TTL_MS }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url')
  return `${body}.${sig}`
}

function verifyToken(token: string): { ok: boolean; username?: string } {
  if (!token || typeof token !== 'string') return { ok: false }
  const parts = token.split('.')
  if (parts.length !== 2) return { ok: false }
  const [body, sig] = parts
  const expectSig = crypto.createHmac('sha256', TOKEN_SECRET).update(body).digest('base64url')
  // 恒时间比较，防时序攻击
  const a = Buffer.from(sig, 'utf8')
  const b = Buffer.from(expectSig, 'utf8')
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      u: string
      exp: number
    }
    if (!payload?.exp || Date.now() > payload.exp) return { ok: false }
    return { ok: true, username: payload.u }
  } catch {
    return { ok: false }
  }
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signToken(username)
    res.json({
      code: 0,
      message: '登录成功',
      data: { token, expiresAt: Date.now() + TOKEN_TTL_MS },
    })
  } else {
    res.json({ code: 1, message: '账号或密码错误' })
  }
})

// 验证接口 - 同时兼容两种调用：
// 1) 新版：Authorization: Bearer <token>      → 仅验证 token，无 DB 查询
// 2) 旧版：body { username, password }          → 向后兼容，调用后会返回一个 token 让前端迁移
app.post('/api/auth/verify', (req, res) => {
  // 优先走 token
  const auth = req.header('authorization') || ''
  const tokenFromHeader = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (tokenFromHeader) {
    const r = verifyToken(tokenFromHeader)
    if (r.ok) {
      res.json({ code: 0, message: '验证成功' })
      return
    }
    res.status(401).json({ code: 401, message: '认证失败，请重新登录' })
    return
  }

  // 向后兼容账密验证
  const { username, password } = req.body || {}
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signToken(username)
    res.json({
      code: 0,
      message: '验证成功',
      data: { token, expiresAt: Date.now() + TOKEN_TTL_MS },
    })
  } else {
    res.status(401).json({ code: 401, message: '认证失败，请重新登录' })
  }
})

// ============ 接口鉴权中间件（仅保护 /api/orders/* 等业务接口）============
function authGuard(req: express.Request, res: express.Response, next: express.NextFunction) {
  const auth = req.header('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token) {
    const r = verifyToken(token)
    if (r.ok) return next()
  }
  // 向后兼容：允许老客户端不带 token 以账密鉴权（过渡期可鼏）
  const u = req.header('x-username')
  const p = req.header('x-password')
  if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) return next()

  return res.status(401).json({ code: 401, message: '认证失败，请重新登录' })
}

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', timestamp: new Date().toLocaleString() })
})

// API 404（必须放在所有 /api 路由之后）
app.use('/api/*', (_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' })
})

// ============ 生产模式：托管前端静态文件 ============
const publicDir = path.join(__dirname, '..', 'public')
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
  console.log('📦 生产模式：已加载前端静态文件')
}

// 全局兜底错误处理（保证最后注册，防止任何异常导致进程崩溃）
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ 未捕获的错误:', err)
  res.status(500).json({
    code: -1,
    message: err?.message || '服务器内部错误',
  })
})

// 等待数据库就绪后启动服务
db.waitForReady().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ 玺华铝业后端服务已启动: http://localhost:${PORT}`)
    console.log(`📋 API 接口:`)
    console.log(`   POST   /api/orders          - 保存订单`)
    console.log(`   GET    /api/orders           - 查询订单列表`)
    console.log(`   GET    /api/orders/:id       - 获取订单详情`)
    console.log(`   PUT    /api/orders/:id       - 更新订单`)
    console.log(`   DELETE /api/orders/:id       - 删除订单`)
    console.log(`   POST   /api/orders/batch-delete - 批量删除`)
    if (fs.existsSync(publicDir)) {
      console.log(`\n🌐 前端页面: http://localhost:${PORT}`)
    }
  })
})
