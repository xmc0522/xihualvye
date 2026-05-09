import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@jpg': fileURLToPath(new URL('./JPG', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3456',
        changeOrigin: true,
      },
    },
  },
  build: {
    // 大于 800KB 的 chunk 才警告（默认 500KB 太严）
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // 把第三方大依赖单独拆出来，便于按需加载
        // exceljs / xlsx-js-style / file-saver 已经改为函数内 dynamic import，会被自动拆成独立 chunk，
        // 这里不再放进 manualChunks，避免被首屏入口提前引入。
        // echarts 同样已改为按需注册（echarts/core 体积小很多）。
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus', '@element-plus/icons-vue'],
        },
      },
    },
  },
})
