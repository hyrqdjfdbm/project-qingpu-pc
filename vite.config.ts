import vue from '@vitejs/plugin-vue';
import { dasComponentResolver } from 'das-component-vue';
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: './auto-imports.d.ts'
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({ importStyle: false }),
        dasComponentResolver()
      ],
      dts: './components.d.ts'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
