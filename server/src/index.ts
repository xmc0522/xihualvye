import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import ordersRouter from './routes/orders.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3456

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// API 路由
app.use('/api/orders', ordersRouter)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 0, message: 'ok', timestamp: new Date().toLocaleString() })
})

// ============ 生产模式：托管前端静态文件 ============
// 前端打包后的文件放在 server/public 目录下
const publicDir = path.join(__dirname, '..', 'public')
if (fs.existsSync(publicDir)) {
  // 托管静态资源（JS、CSS、图片等）
  app.use(express.static(publicDir))

  // 所有非 /api 开头的请求都返回 index.html（支持 Vue Router 的 history 模式）
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
  console.log('📦 生产模式：已加载前端静态文件')
}

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
