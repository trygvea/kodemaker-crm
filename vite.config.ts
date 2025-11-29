import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/image': path.resolve(__dirname, './cosmos/mocks/next-image.tsx'),
      'next/link': path.resolve(__dirname, './cosmos/mocks/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './cosmos/mocks/next.tsx'),
      'next-auth/react': path.resolve(__dirname, './cosmos/mocks/next-auth.tsx'),
    },
  },
  css: {
    postcss: './postcss.config.mjs',
  },
})
