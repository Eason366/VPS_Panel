// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 👈 加这一段
    port: 5173,         // 可以不加，默认就是5173
    strictPort: true    // 如果5173端口被占用，报错而不是自动换端口（可选）
  }
})
