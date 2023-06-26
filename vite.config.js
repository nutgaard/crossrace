import { defineConfig } from 'vite'

export default defineConfig({
    base: process.env.ZIP_DISTRIBUTION === 'true' ? '' : 'crossrace'
})