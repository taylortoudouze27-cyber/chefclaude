import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from https://<user>.github.io/chefclaude/ in production, so the
// build needs the repo name as a base path. Local dev stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/chefclaude/' : '/',
  plugins: [react()],
}))
