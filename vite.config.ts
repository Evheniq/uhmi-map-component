import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      include: ['src/**/*.ts', 'src/**/*.vue'],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueMaptilerPolygons',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        `vue-maptiler-polygons.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      external: ['vue', '@maptiler/sdk'],
      output: {
        globals: {
          vue: 'Vue',
          '@maptiler/sdk': 'maptilersdk',
        },
      },
    },
    cssCodeSplit: false,
  },
})
