import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 9999,
  },
  build: {
    lib: {
      entry: "./src/index.js",  // 入口文件
      name: "vue-workflow-diagram",
      fileName: (format) => `index.${format}.js`,
      formats: ["es", "umd"] // 生成 ES Module 和 CommonJS 两种格式
    },
    rollupOptions: {
      external: ["vue"],  // 避免打包 `vue`，让使用者自行安装
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  },
})
