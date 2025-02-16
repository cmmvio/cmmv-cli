module.exports = {
    env: process.env.NODE_ENV,
    
    server: {
        host: "0.0.0.0",
        port: 3000,        
        poweredBy: false,
        removePolicyHeaders: false,
        compress: {
            enabled: true
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
        minifyHTML: true
    },
    
    i18n: {
        localeFiles: "./src/locale",
        default: "en"
    },
//%OTHERSETTINGS%
};