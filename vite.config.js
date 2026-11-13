import { defineConfig } from 'vite'

// Three.js is loaded as its own chunk and is a little over the default warning size.
export default defineConfig({ build: { chunkSizeWarningLimit: 700 } })
