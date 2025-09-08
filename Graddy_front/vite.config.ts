import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

// https://vitejs.dev/config/
export default defineConfig({
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    define: {
        global: 'globalThis',
        'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.NODE_ENV === 'production' ? '/api' : 'http://ec2-3-113-246-191.ap-northeast-1.compute.amazonaws.com:8080/api')
    },
    optimizeDeps: {
        include: ['sockjs-client', '@stomp/stompjs']
    }
})