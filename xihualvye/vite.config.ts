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
  optimizeDeps: {
    include: ['exceljs'],
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
        // 把第三方大依赖单独拆出来，便于 CDN 缓存与并行下载
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-element': ['element-plus', '@element-plus/icons-vue'],
          'vendor-echarts': ['echarts'],
          'vendor-excel': ['exceljs', 'file-saver', 'xlsx-js-style'],
        },
      },
    },
  },
})
