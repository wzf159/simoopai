import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig({
  plugins: [VueDevTools(), vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      // 配置代理规则
      '/files': {
        target: 'http://localhost:8000', // 后端服务地址
        changeOrigin: true, // 允许跨域请求
        rewrite: (path) => path // 重写请求路径
      },
      '/translate': {
        target: 'http://localhost:8000', // 后端服务地址
        changeOrigin: true, // 允许跨域请求
        rewrite: (path) => path // 重写请求路径
      }
    }
  }
})
