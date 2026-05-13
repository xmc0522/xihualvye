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

        // Token 密钥：保证 pm2 restart 后旧 token 仍有效（不强制用户重新登录）
        // 推荐用强随机串（32+ 字节），可用 Node 一行命令生成：
        //   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
        // 改后再次 restart 一次即生效；若想强制所有用户重新登录，改这个值即可。
        TOKEN_SECRET: 'xhly_change_me_to_a_long_random_secret_at_least_32_chars',

        // 数据库目录（默认 dist/../data，无特殊需求保持默认即可）
        // DB_DIR: '/xmc/xihualvye/data',
      },
    },
  ],
}
