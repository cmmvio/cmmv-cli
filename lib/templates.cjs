module.exports = {
    ".gitignore": `# CMMV Settings
.env

/dist
/node_modules
/admin
/secure
/http
/backup

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
yarn.lock
pnpm-lock.yaml

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# SQLite
*.sqlite

# Gsuite
googleapis.json
newrelic.js
docs/algolia.json
docs/index.json
docs/indexLinks.json
docs/index*.json
public/sitemap.xml
docs/*.json
docs/**/*.json`,

    ".npmignore": `# source
**/*.ts
*.ts

# definitions
!**/*.d.ts
!*.d.ts

# configuration
package-lock.json
tslint.json
tsconfig.json
.prettierrc
yarn.lock
pnpm-lock.yaml

*.tsbuildinfo
.env`,

    ".prettierignore": `node_modules
dist
*.log
`,

    ".prettierrc": `{
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 80,
    "tabWidth": 2,
    "useTabs": false,
    "plugins": ["prettier-plugin-tailwindcss"],
    "pluginSearchDirs": ["."],
    "vueIndentScriptAndStyle": true
}`,

    ".swcrc": `{
    "jsc": {
      "parser": {
        "syntax": "typescript",
        "decorators": true
      },
      "transform": {
        "legacyDecorator": true,
        "decoratorMetadata": true
      }
    },
    "module": {
      "type": "commonjs"
    }
}`,

    "app.module.ts": `// Generated automatically by CMMV

import 'reflect-metadata';
import { Module, ApplicationTranspile } from '@cmmv/core';

export let ApplicationModule = new Module("app", {
    transpilers: [ApplicationTranspile]
});`,

    "app.vue": `<template>
    <div class="container">
      <div class="logo-container center" style="text-align: center;">
        <img
          src="https://raw.githubusercontent.com/cmmvio/docs.cmmv.io/main/public/assets/logo_CMMV2_icon.png"
          alt="CMMV Logo"
          class="logo m-auto"
        />
        <h1 class="title">Hello World CMMV</h1>
      </div>
    </div>
</template>
  
<style scoped>
  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to bottom, #000000, #00172d);
    overflow: hidden;
    position: relative;
  }
  
  .container::before {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(0, 255, 150, 0.4), transparent 70%);
    filter: blur(150px);
    animation: auroraGreen 8s infinite alternate ease-in-out;
    z-index: 0;
  }
  
  .container::after {
    content: "";
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(128, 0, 255, 0.4), transparent 70%);
    filter: blur(150px);
    animation: auroraPurple 10s infinite alternate-reverse ease-in-out;
    z-index: 0;
  }
  
  @keyframes auroraGreen {
    0% {
      transform: translate(-10%, -20%) rotate(0deg);
    }
    50% {
      transform: translate(15%, 25%) rotate(60deg);
    }
    100% {
      transform: translate(-10%, -20%) rotate(120deg);
    }
  }
  
  @keyframes auroraPurple {
    0% {
      transform: translate(10%, 20%) rotate(0deg);
    }
    50% {
      transform: translate(-15%, -25%) rotate(-60deg);
    }
    100% {
      transform: translate(10%, 20%) rotate(-120deg);
    }
  }
  
  .logo-container {
    position: relative;
    text-align: center;
    z-index: 1;
  }
  
  .logo {
    width: 150px;
    height: auto;
    margin-bottom: 20px;
    animation: float 3s ease-in-out infinite;
  }
  
  .title {
    color: white;
    font-size: 2rem;
    font-family: 'Arial', sans-serif;
    text-shadow: 0 0 10px rgba(0, 255, 150, 0.7), 0 0 20px rgba(128, 0, 255, 0.7);
  }
  
  @keyframes float {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
  
<script setup lang="ts">
import CmmvMixins from "./assets/rpc-mixins.js";

defineOptions({
    mixins: [CmmvMixins],
});
</script>`,

    "client-formbuilder.ts": `import { createApp } from 'vue';
import App from './app.vue';
import Vueform from '@vueform/vueform';
import MaskPlugin from '@vueform/plugin-mask';
import { createI18n } from 'vue-i18n'
import vueformConfig from '../vueform.config';

const i18n = createI18n({
    silentTranslationWarn: true, 
    silentFallbackWarn: true,   
    missingWarn: false,        
    fallbackWarn: false,
});

const app = createApp(App);
app.use(i18n);
app.use(Vueform, vueformConfig);
app.use(MaskPlugin);
app.mount('#app');`,

    "client.ts": `import { createApp } from 'vue';
import App from './app.vue';

const app = createApp(App);
app.mount('#app')`,

    "index-formbuilder.html": `<!doctype html>
<html lang="en-US" dir="ltr" class="dark" data-theme="dark">
    <head>
        <title>CMMV FormBuilder</title>
        <meta charset="UTF-8" />
        <link rel="icon" href="/assets/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="/assets/bundle.min.css" />
        <script type="text/javascript" src="/assets/protobuf.min.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="dark:text-white dark:bg-neutral-900">
        <div id="app"></div>
        <script type="module" src="/public/client.ts"></script>
    </body>
</html>`,

    "index.html": `<!doctype html>
<html lang="en">
    <head>
        <title>CMMV Client</title>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="" href="/assets/bundle.min.css" />
        <script type="text/javascript" src="api/assets/protobuf.min.js"></script>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="/src/client.ts"></script>
    </body>
</html>`,

    "nodemon.json": `{
    "watch": ["src", "public"],
    "ext": "ts,js,md,html",
    "ignore": [
        "src/**/*.spec.ts", "src/app.module.ts", 
        "src/**/*", "public/core/*", 
        "public/assets/**/*", "public/assets/*",
        "src/controllers"
    ],
    "exec": "SWC_NODE_PROJECT=tsconfig.server.json node -r @swc-node/register ./src/server.ts" 
}`,

    "robots.txt": `# *
User-agent: *
Allow: /`,

    "tsconfig.client.json": `{
    "compilerOptions": {
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
        "incremental": true,
        "target": "ES2022",
        "lib": ["ES2023"],
        "module": "ESNext",
        "skipLibCheck": true,
    
        /* Bundler mode */
        "moduleResolution": "Bundler",
        "allowImportingTsExtensions": true,
        "isolatedModules": true,
        "moduleDetection": "force",
        "noEmit": true,
    
        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true
    },
    "include": ["vite.config.ts"]
}`,

    "tsconfig.server.json": `{
    "compilerOptions": {
        "module": "commonjs",
		"moduleResolution": "node",
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        "target": "ES6",
        "sourceMap": true,
        "outDir": "dist",
        "baseUrl": ".",
        "incremental": true,
        "skipLibCheck": true,
        "esModuleInterop": false,
        "strictNullChecks": false,
        "noUnusedLocals": false,
        "noImplicitAny": false,
        "strictBindCallApply": false,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": false,
        "resolveJsonModule": true,
        "noLib": false,
        "useUnknownInCatchVariables": false,
        "noImplicitThis": true,
        "useDefineForClassFields": true,
        "allowJs": false,
        "lib": ["esnext", "dom"],
        "types": ["node", "mocha"],
    },
    "include": ["src/**/*.ts", "vueform.config.ts",],
    "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}`,

    "tsconfig.vue.json": `{
    "compilerOptions": {
        "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
        "incremental": true,
        "target": "ES2020",
        "useDefineForClassFields": true,
        "module": "ESNext",
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "skipLibCheck": true,
    
        /* Bundler mode */
        "moduleResolution": "Bundler",
        "allowImportingTsExtensions": true,
        "isolatedModules": true,
        "moduleDetection": "force",
        "noEmit": true,
        "jsx": "preserve",
    
        /* Linting */
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "noUncheckedSideEffectImports": true
    },
    "include": ["src/**/*.vue", "public/**/*.vue"]
}`,

    "vite.config-formbuilder.mts": `import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue';
import postcssNesting from 'postcss-nesting';

export default defineConfig({
    envDir: './',

    css: {
        preprocessorOptions: {
            scss: {
              additionalData: '@import "@vueform/vueform/themes/vueform/scss/index.scss";'
            }
        },
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },

    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => tag.includes('-')
                }
            }
        }), 
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

    build: {
        target: 'esnext',
        minify: 'terser',
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'cmmv',
            fileName: (format) => \`cmmv.\${format}.js\`,
            formats: ['es', 'cjs', 'umd', 'iife']
        },
        rollupOptions: {
            external: ['vue'],                  
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    },
    
    resolve: {
        alias: {
            '@': resolve(__dirname, 'public')    
        }
    }
})`,

    "vite.config.js": `import path from 'node:path';
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
});`,

    "vueform.config.ts": `import en from '@vueform/vueform/locales/en';
import tailwind from '@vueform/vueform/dist/tailwind';
import { defineConfig } from '@vueform/vueform';

export default defineConfig({
    theme: tailwind,
    locales: { en },
    locale: 'en',
});`,

    "release.js": `'use strict';

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { cwd } = require('process');
const enquirer = require('enquirer');

const { prompt } = enquirer;

async function main() {
    const chalk = (await import('chalk')).default;
    const { execa } = await import('execa');

    const currentVersion = JSON.parse(fs.readFileSync(path.resolve(cwd(), 'package.json'), 'utf-8')).version;
    const versionIncrements = ['patch', 'minor', 'major'];

    const inc = (i) => semver.inc(currentVersion, i);
    const run = async (bin, args, opts = {}) => {
        try {
            await execa(bin, args, { stdio: 'inherit', ...opts });
        } catch (err) {
            console.error(chalk.red(\`Error running command: \${bin} \${args.join(' ')}\`));
            console.error(err.message);
            process.exit(1);
        }
    };
    const step = (msg) => console.log(chalk.cyan(msg));

    let targetVersion;

    try {
        // Prompt release type
        const { release } = await prompt({
            type: 'select',
            name: 'release',
            message: 'Select release type:',
            choices: versionIncrements.map((i) => \`\${i} (\${inc(i)})\`).concat(['custom']),
        });

        if (release === 'custom') {
            const { version } = await prompt({
                type: 'input',
                name: 'version',
                message: 'Input custom version:',
                initial: currentVersion,
            });
            targetVersion = version;
        } else {
            targetVersion = release.match(/\((.*)\)/)[1];
        }

        if (!semver.valid(targetVersion)) {
            throw new Error(\`Invalid target version: \${targetVersion}\`);
        }

        // Confirm release
        const { yes: tagOk } = await prompt({
            type: 'confirm',
            name: 'yes',
            message: \`Releasing v\${targetVersion}. Confirm?\`,
        });

        if (!tagOk) {
            console.log(chalk.yellow('Release canceled.'));
            return;
        }

        // Update the package version
        step('\nUpdating the package version...');
        updatePackage(targetVersion);

        // Generate the changelog
        step('\nGenerating the changelog...');
        await run('pnpm', ['run', 'changelog']);

        const { yes: changelogOk } = await prompt({
            type: 'confirm',
            name: 'yes',
            message: \`Changelog generated. Does it look good?\`,
        });

        if (!changelogOk) {
            console.log(chalk.yellow('Release canceled after changelog review.'));
            return;
        }

        // Commit changes and create a Git tag
        step('\nCommitting changes...');
        await run('git', ['add', 'CHANGELOG.md', 'package.json']);
        await run('git', ['commit', '-m', \`release: v\${targetVersion}\`]);
        await run('git', ['tag', \`v\${targetVersion}\`]);

        // Publish the package
        step('\nPublishing the package...');
        await run('pnpm', ['publish', '--access', 'public']);

        // Push changes to GitHub
        step('\nPushing to GitHub...');
        await run('git', ['push', 'origin', \`refs/tags/v\${targetVersion}\`]);
        await run('git', ['push']);

        console.log(chalk.green(\`\nSuccessfully released v\${targetVersion}!\`));
    } catch (err) {
        console.error(chalk.red(\`\nAn error occurred during the release process:\`));
        console.error(err.message);
        process.exit(1);
    }
}

function updatePackage(version) {
    const pkgPath = path.resolve(cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    pkg.version = version;

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    console.log(\`Updated package.json version to \${version}\`);
}

main().catch((err) => {
    console.error(\`\nUnexpected error:\`);
    console.error(err.message);
    process.exit(1);
});
`,

    "tsconfig.cjs.json": `{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "module": "commonjs",
        "outDir": "./dist/cjs",
        "declaration": true,
        "declarationDir": "./dist/types"
    }
}
`,

    "tsconfig.esm.json": `{
    "extends": "./tsconfig.json",
    "compilerOptions": {
        "module": "esnext",
        "outDir": "./dist/esm",
        "declaration": true,
        "declarationDir": "./dist/types"
    }
}
`,

    "tsconfig.build.json": `{
    "compilerOptions": {
        "module": "commonjs",
        "moduleResolution": "node",
        "declaration": true,
        "removeComments": true,
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        "target": "ESNext",
        "sourceMap": true,
        "outDir": "dist",
        "baseUrl": ".",
        "incremental": true,
        "skipLibCheck": true,
        "esModuleInterop": false,
        "strictNullChecks": false,
        "noUnusedLocals": false,
        "noImplicitAny": false,
        "strictBindCallApply": false,
        "forceConsistentCasingInFileNames": true,
        "noFallthroughCasesInSwitch": false,
        "resolveJsonModule": true,
        "noLib": false,
        "useUnknownInCatchVariables": false,
        "noImplicitThis": true,
        "useDefineForClassFields": true,
        "allowJs": false,
        "importHelpers": true,
        "lib": ["esnext", "dom"],
        "types": ["node"],
    },
    "include": ["src/**/*.ts"],
    "exclude": ["node_modules", "dist", "**/*.spec.ts"]
}
`,

    ".commitlintrc.json": `{
	"extends": ["@commitlint/config-angular"],
    "rules": {
      	"subject-case": [
			2,
			"always",
			["sentence-case", "start-case", "pascal-case", "upper-case", "lower-case"]
      	],
      	"type-enum": [
			2,
			"always",
			[
				"build",
				"chore",
				"ci",
				"docs",
				"feat",
				"fix",
				"perf",
				"refactor",
				"revert",
				"style",
				"test",
				"sample",
				"update",
				"release"
			]
      	]
    }
}`
}