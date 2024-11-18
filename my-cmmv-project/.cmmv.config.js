module.exports = {
    env: process.env.NODE_ENV,
    
    server: {
        host: process.env.HOST || "127.0.0.1",
        port: process.env.PORT || 3000,        
        poweredBy: false,
        removePolicyHeaders: false,
        compress: {
            enabled: true,
            options: {
                level: 6 
            }
        },
        cors: true,
        helmet: {
            enabled: false,
            options: {
                contentSecurityPolicy: false
            }
        }
    },

    view: {
        extractInlineScript: false,
        minifyHTML: true,
        vue3: true,
tailwind: true

    },
    
    i18n: {
        localeFiles: "./src/locale",
        default: "en"
    },

    head: {
        title: "My CMMV Project",
        htmlAttrs: {
            lang: "en"
        },
        meta: [
            { charset: 'utf-8' },
            { name: 'description', content: '' },
            { name: 'keywords', content: '' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' }
        ],
        link: [
            { rel: 'icon', href: 'assets/favicon.ico' },
            { rel: 'stylesheet', href: '/assets/bundle.min.css' }                     
        ]
    },
    
    scripts: [
        { 
            type: "text/javascript", 
            src: "/assets/bundle.min.js", 
            defer: "defer" 
        }
    ],

    rpc: {
        enabled: true,
        preLoadContracts: true,
    },
cache: {
        store: '@tirke/node-cache-manager-ioredis',
        getter: 'ioRedisStore',
        host: 'localhost',
        port: 6379,
        ttl: 600,
    },
repository: { 
        type: 'sqlite', 
        database: './database.sqlite',
        synchronize: true,
        logging: true,  
    },
};