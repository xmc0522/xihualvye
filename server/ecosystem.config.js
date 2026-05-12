/**
 * PM2 生产环境启动配置
 *
 * 使用方法：
 *   1) 把本文件放在服务器 /xmc/xihualvye/ecosystem.config.js
 *   2) 修改下面的 ADMIN_PASSWORD
 *   3) 启动：cd /xmc/xihualvye && pm2 start ecosystem.config.js
 *   4) 保存：pm2 save
 *   5) 修改后重载：pm2 restart xihualvye --update-env
 *
 * 详见 部署上线文档.md 第三、四章
 */
module.exports = {
  apps: [
    {
      name: 'xihualvye',
      script: './dist/index.js',
      cwd: '/xmc/xihualvye',

      // 单进程 fork 模式（better-sqlite3 是单写多读，集群模式会冲突，必须 fork + instances=1）
      instances: 1,
      exec_mode: 'fork',

      // 进程守护
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,

      // 日志
      out_file: './logs/out.log',
      error_file: './logs/err.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // === 生产环境变量（务必修改！） ===
      env: {
        NODE_ENV: 'production',

        // 后端监听端口
        PORT: 3456,

        // 登录账号
        ADMIN_USERNAME: 'xhly',

        // ⚠️ 强烈建议改成强密码（≥12位，含字母数字符号）
        ADMIN_PASSWORD: '123123',

        // 注：未设置 TOKEN_SECRET 时，服务会在启动时自动生成随机密钥；
        // 副作用是每次 pm2 restart 后所有用户需重新登录一次，对小型后台无影响。

        // 数据库目录（默认 dist/../data，无特殊需求保持默认即可）
        // DB_DIR: '/xmc/xihualvye/data',
      },
    },
  ],
}
