import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyTemplateToProject(templateName, finalPath){
    let tmpContent = await fs.readFile(
        path.join(__dirname, 'templates', templateName),
        'utf-8'
    );
    fs.writeFile(finalPath, tmpContent);
}

export const configureProject = async ({
    projectName,
    vite,
    rpc,
    cache,
    repository,
    view,
    eslint,
    prettier,
    vitest
}) => {
    const projectPath = path.resolve(process.cwd(), projectName);

    await fs.mkdir(path.join(projectPath), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "locale"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "contracts"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "controllers"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "entities"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "models"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "modules"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "src", "services"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "public"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "public", "assets"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "public", "core"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "public", "templates"), { recursive: true });
    await fs.mkdir(path.join(projectPath, "public", "views"), { recursive: true });

    await copyTemplateToProject('robots.txt', path.join(projectPath, "public", "robots.txt"));
    await copyTemplateToProject('favicon.ico', path.join(projectPath, "public", "favicon.ico"));
    await copyTemplateToProject('.gitignore', path.join(projectPath, ".gitignore"));
    await copyTemplateToProject('.npmignore', path.join(projectPath, ".npmignore"));
    await copyTemplateToProject('.prettierignore', path.join(projectPath, ".prettierignore"));
    await copyTemplateToProject('.prettierrc', path.join(projectPath, ".prettierrc"));
    await copyTemplateToProject('.swcrc', path.join(projectPath, ".swcrc"));
    await copyTemplateToProject('nodemon.json', path.join(projectPath, "nodemon.json"));
    await copyTemplateToProject('tsconfig.server.json', path.join(projectPath, "tsconfig.server.json"));

    const configPath = path.join(projectPath, '.cmmv.config.js');
    const packageJsonPath = path.join(projectPath, 'package.json');
    const viteConfigPath = path.join(projectPath, 'vite.config.js');
    const vitestConfigPath = path.join(projectPath, 'vitest.config.ts');
    const eslintConfigPath = path.join(projectPath, '.eslintrc.js');
    const srcPath = path.join(projectPath, 'src');

    let configContent = await fs.readFile(
        path.join(__dirname, 'templates', '.cmmv.config.js'),
        'utf-8'
    );

    let viteContent = await fs.readFile(
        path.join(__dirname, 'templates', 'vite.config.js'),
        'utf-8'
    );

    let viewSettings = '';
    let otherSettings = '';

    let modules = [
        '@cmmv/core',
        '@cmmv/http',
        '@cmmv/repository',
        '@cmmv/view',
        'class-transformer',
        'class-validator',
        'dotenv',
        'fast-json-stringify',
        'reflect-metadata',
        'typeorm',
        'fast-glob'
    ];
    let moduleDev = [
        '@swc-node/core',
        '@swc-node/register',
        '@swc/core',
        '@types/node',
        'typescript',
        'nodemon',
        'concurrently'
    ];

    if (vite) {
        moduleDev.push('vite');
        moduleDev.push('@vitejs/plugin-vue');
        moduleDev.push('@vitejs/plugin-vue-jsx');
        moduleDev.push('@cmmv/plugin-vite');
        await copyTemplateToProject('tsconfig.client.json', path.join(projectPath, "tsconfig.client.json"));
        await copyTemplateToProject('index.html', path.join(projectPath, "index.html"));
    }   
    
    if (rpc) {
        fs.mkdir(path.join(projectPath, "src", "gateways"));
        fs.mkdir(path.join(projectPath, "src", "protos"));

        modules.push('@cmmv/ws');
        modules.push('@cmmv/protobuf');

        otherSettings += `rpc: {
        enabled: true,
        preLoadContracts: true,
    },\n`;

        await copyTemplateToProject('protobuf.min.js', path.join(projectPath, "public", "assets", "protobuf.min.js"));
    }

    if (cache) {
        modules.push('@cmmv/cache');
        modules.push('@tirke/node-cache-manager-ioredis');

        otherSettings += `cache: {
        store: '@tirke/node-cache-manager-ioredis',
        getter: 'ioRedisStore',
        host: 'localhost',
        port: 6379,
        ttl: 600,
    },\n`;  
    }

    switch (repository) {
        case 'Sqlite':
            modules.push('sqlite3');
            otherSettings += `repository: { 
        type: 'sqlite', 
        database: './database.sqlite',
        synchronize: true,
        logging: true,  
    },`;
            break;
        case 'MongoDB':
            modules.push('mongodb');
            otherSettings += `repository: { 
        type: 'mongodb', 
        host: 'localhost',
        port: 27017,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`;
            break;
        case 'PostgreSQL':
            modules.push('pg');
            otherSettings += `repository: { 
        type: 'postgres', 
        host: 'localhost', 
        port: 5432,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`;
            break;
        case 'MySQL':
            modules.push('mysql');
            otherSettings += `repository: { 
        type: 'mysql', 
        host: 'localhost', 
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`;
            break;
    }

    if (view === 'Vue3' || view === 'Vue3 + TailwindCSS') {
        modules.push('vue@3');
        viewSettings += 'vue3: true,\n';
        await copyTemplateToProject('tsconfig.vue.json', path.join(projectPath, "tsconfig.vue.json"));

        if (vite) {
            moduleDev.push('@vitejs/plugin-vue');
            moduleDev.push('@vitejs/plugin-vue-jsx');
        }
    } else {
        modules.push('@cmmv/reactivity');
        moduleDev.push('@cmmv/plugin-vite');
    }

    if (view === 'Vue3 + TailwindCSS') {
        moduleDev.push('tailwindcss');
        viewSettings += 'tailwind: true\n';

        await fs.writeFile(
            path.join(projectPath, 'tailwind.config.js'),
            `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./**/*.{vue,js,ts,jsx,tsx}'],
    theme: { extend: {} },
    plugins: [],
};`
        );

        await fs.writeFile(
            path.join(srcPath, 'tailwind.css'),
            `@tailwind base;
@tailwind components;
@tailwind utilities;`
        );
    }

    // Create .cmmv.config.js
    configContent = configContent.replace("//%VIEWSETTINGS%", viewSettings);
    configContent = configContent.replace("//%OTHERSETTINGS%", otherSettings);
    await fs.writeFile(configPath, configContent, 'utf-8');

    // Create package.json
    const packageJsonContent = {
        name: projectName,
        version: '0.0.1',
        description: "",
        author: "Your name",
        scripts: {
            dev: vite ? 'NODE_ENV=dev concurrently \"nodemon\" \"vite dev\"' : 'NODE_ENV=dev nodemon',
            build: vite ? 'concurrently \"tsc\" \"vite build\"' : 'tsc',
            start: vite ? 'NODE_ENV=prod concurrently \"node dist/server.js\" \"node dist/client.js\"' : 'node dist/server.js',
            test:  vitest ? "vitest" : "",
        },
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf-8');

    // Create vite.config.js
    if (vite) 
        await fs.writeFile(viteConfigPath, viteContent, 'utf-8');
    
    // Create vitest.config.ts
    if (vitest) {
        const vitestConfig = `
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    }
});
`;
        await fs.writeFile(vitestConfigPath, vitestConfig, 'utf-8');
    }

    // Create .eslintrc.js
    if (eslint) {
        moduleDev.push("@typescript-eslint/eslint-plugin");
        moduleDev.push("@typescript-eslint/parser");

        if(view === 'Vue3' || view === 'Vue3 + TailwindCSS')
            moduleDev.push("vue-eslint-parser");

        if(vite)
            moduleDev.push("vite-plugin-eslint");

        const eslintConfig = `const js = require('@eslint/js');

module.exports = {
    js.configs.recommended,
    {
        ignores: ['**/node_modules/**', '*.d.ts', '*.js', '**/*.spec.ts'],
        rules: {},
    },
};
`;
        await fs.writeFile(eslintConfigPath, eslintConfig, 'utf-8');
    }

    // src/server.ts
    const serverConfigPath = path.join(srcPath, 'server.ts');
    await copyTemplateToProject('app.module.ts', path.join(srcPath, 'app.module.ts'));

    await fs.writeFile(serverConfigPath, `import 'reflect-metadata';

import { Application } from '@cmmv/core';
import { DefaultAdapter, DefaultHTTPModule } from '@cmmv/http';
${rpc ? `import { ProtobufModule } from '@cmmv/protobuf';\nimport { WSModule, WSAdapter } from '@cmmv/ws';` : ""}
import { ViewModule, VueTranspile } from '@cmmv/view';
import { RepositoryModule, Repository } from '@cmmv/repository';
${cache? "import { CacheModule, CacheService } from '@cmmv/cache';" :''}

import { ApplicationModule } from './app.module';

Application.create({
    httpAdapter: DefaultAdapter,
    wsAdapter: WSAdapter,
    modules: [
        DefaultHTTPModule,
        ${rpc ? 'ProtobufModule,\nWSModule,' : ''}
        ViewModule,
        RepositoryModule,
        ${cache? "CacheModule," :''}
        ApplicationModule,
    ],
    services: [Repository, ${cache? "CacheService" :''}],
    transpilers: [${view === 'Vue3' || view === 'Vue3 + TailwindCSS' ? "VueTranspile" :''}],
    contracts: [],
});`, 'utf-8');

    //src/client.ts
    if(vite){
        await copyTemplateToProject('client.ts', path.join(srcPath, 'client.ts'));
        await copyTemplateToProject('App.vue', path.join(srcPath, 'App.vue'));
    }

    // Generate tsconfig.json dynamically
    const tsconfigReferences = [];
    if (vite) tsconfigReferences.push({ path: './tsconfig.client.json' });
    if (view === 'Vue3' || view === 'Vue3 + TailwindCSS') {
        tsconfigReferences.push({ path: './tsconfig.vue.json' });
    }
    tsconfigReferences.push({ path: './tsconfig.server.json' });

    const tsconfigContent = {
        files: [],
        references: tsconfigReferences
    };

    await fs.writeFile(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(tsconfigContent, null, 4),
        'utf-8'
    );

    // Install dependencies
    await execa('pnpm', ['add', '-D', ...moduleDev], { cwd: projectPath });
    await execa('pnpm', ['add', ...modules], { cwd: projectPath });
};
