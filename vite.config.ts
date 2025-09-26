import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    // Resolver paths with @ alias
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },

    // CSS Processing
    css: {
        preprocessorOptions: {
            scss: {
                // Inject Bootstrap variables globally
                additionalData: '@import "@/styles/variables.scss";'
            }
        }
    },

    // Server Configuration
    server: {
        port: 3000,
        open: true,
        host: true
    },

    // Build Configuration
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html')
            }
        }
    },

    // Environment Variables
    envPrefix: 'VITE_',

    // Define global constants
    define: {
        __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
    }
})