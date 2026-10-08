import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { liveServerPlugin } from './src/server/viteLivePlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  base: '/clase-programacion/',
  plugins: [react(), tailwindcss(), liveServerPlugin()],
})
