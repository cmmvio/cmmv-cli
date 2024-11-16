import path from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsxPlugin from '@vitejs/plugin-vue-jsx';
import { cmmvPlugin } from '@cmmv/plugin-vite';

export default defineConfig({
    envDir: './',

    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.includes('-')
                }
            }
        }), 
        vueJsxPlugin(),
        cmmvPlugin()
    ],
    
    server: {
        host: true,
        port: 5000, 
        cors: {
            origin: 'http://localhost:3000', 
            credentials: true, 
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false, 
                rewrite: (path) => path.replace(/^\/api/, ''), 
            },
        },
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'public')
        },
    }
});
