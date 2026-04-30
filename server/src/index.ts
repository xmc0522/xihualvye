import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import db from './db'
import ordersRouter from './routes/orders'

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3456

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// API 路由
app.use('/api/orders', ordersRouter)

// 登录接口
// 优先从环境变量读取（生产环境强烈推荐），未配置则使用默认值
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'xhly'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123123'

if (!process.env.ADMIN_PASSWORD) {
  console.warn('⚠️  未设置 ADMIN_PASSWORD 环境变量，正在使用默认密码（不安全）！')
  console.warn('   生产部署请通过 PM2 ecosystem 文件或启动命令设置，例如：')
  console.warn('   ADMIN_USERNAME=admin ADMIN_PASSWORD=YourStrongPwd pm2 start dist/index.js --name xihualvye --update-env')
}

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ code: 0, message: '登录成功' })
  } else {
    res.json({ code: 1, message: '账号或密码错误' })
  }
})

// 验证接口 - 检查当前登录的用户密码是否还有效
app.post('/api/auth/verify', (req, res) => {
  const { username, password } = req.body
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    res.json({ code: 0, message: '验证成功' })
  } else {
    res.status(401).json({ code: 401, message: '认证失败，请重新登录' })
  }
})

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
