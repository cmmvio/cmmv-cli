import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyTemplateToProject(templateName, finalPath) {
    const templateContent = await fs.readFile(
        path.join(__dirname, 'templates', templateName),
        'utf-8'
    );
    await fs.writeFile(finalPath, templateContent);
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
    vitest,
    formbuilder
}) => {
    const projectPath = path.resolve(process.cwd(), projectName);
    const configPath = path.join(projectPath, '.cmmv.config.js');
    const packageJsonPath = path.join(projectPath, 'package.json');
    const publicPath = path.join(projectPath, 'public');
    const srcPath = path.join(projectPath, 'src');

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

    // Create project directories
    const directories = [
        'src',
        'src/locale',
        'src/contracts',
        'src/controllers',
        'src/entities',
        'src/models',
        'src/modules',
        'src/services',
        'public',
        'public/assets',
        'public/core',
        'public/templates',
        'public/views',
    ];

    if (formbuilder) {
        directories.push('src/views');
    }

    for (const dir of directories) {
        await fs.mkdir(path.join(projectPath, dir), { recursive: true });
    }

    // Copy static templates
    const templatesToCopy = [
        { name: 'robots.txt', dest: 'public/robots.txt' },
        { name: 'favicon.ico', dest: 'public/favicon.ico' },
        { name: '.gitignore', dest: '.gitignore' },
        { name: '.npmignore', dest: '.npmignore' },
        { name: '.prettierignore', dest: '.prettierignore' },
        { name: '.prettierrc', dest: '.prettierrc' },
        { name: '.swcrc', dest: '.swcrc' },
        { name: 'nodemon.json', dest: 'nodemon.json' },
        { name: 'tsconfig.server.json', dest: 'tsconfig.server.json' },
    ];

    for (const template of templatesToCopy) {
        await copyTemplateToProject(template.name, path.join(projectPath, template.dest));
    }

    // Initialize settings
    let viewSettings = '';
    let otherSettings = '';

    const modules = [
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

    const devModules = [
        '@swc-node/core',
        '@swc-node/register',
        '@swc/core',
        '@types/node',
        'typescript',
        'nodemon',
        'concurrently'
    ];

    // Configure Vite
    if (vite) {
        devModules.push('vite', '@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx', '@cmmv/plugin-vite');
        await copyTemplateToProject('tsconfig.client.json', path.join(projectPath, 'tsconfig.client.json'));
        const viteIndex = formbuilder ? 'index-formbuilder.html' : 'index.html';
        await copyTemplateToProject(viteIndex, path.join(projectPath, 'index.html'));
        await copyTemplateToProject('app.vue', path.join(publicPath, 'app.vue'));
        console.log('✅ Vite settings created.');
    }

    // Configure RPC
    if (rpc) {
        await fs.mkdir(path.join(projectPath, 'src/gateways'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'src/protos'), { recursive: true });

        modules.push('@cmmv/ws', '@cmmv/protobuf');
        otherSettings += `rpc: {
        enabled: true,
        preLoadContracts: true,
    },\n`;

        await copyTemplateToProject('protobuf.min.js', path.join(projectPath, 'public/assets/protobuf.min.js'));
    }

    // Configure Cache
    if (cache) {
        modules.push('@cmmv/cache', '@tirke/node-cache-manager-ioredis');
        otherSettings += `cache: {
        store: '@tirke/node-cache-manager-ioredis',
        getter: 'ioRedisStore',
        host: 'localhost',
        port: 6379,
        ttl: 600,
    },\n`;
    }

    // Configure repository
    const repositoryConfigs = {
        Sqlite: {
            module: 'sqlite3',
            settings: `repository: { 
        type: 'sqlite', 
        database: './database.sqlite',
        synchronize: true,
        logging: true,  
    },`
        },
        MongoDB: {
            module: 'mongodb',
            settings: `repository: { 
        type: 'mongodb', 
        host: 'localhost',
        port: 27017,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`
        },
        PostgreSQL: {
            module: 'pg',
            settings: `repository: { 
        type: 'postgres', 
        host: 'localhost', 
        port: 5432,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`
        },
        MySQL: {
            module: 'mysql2',
            settings: `repository: { 
        type: 'mysql', 
        host: 'localhost', 
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`
        },
        MsSQL: {
            module: 'mssql',
            settings: `repository: { 
        type: 'mssql', 
        host: 'localhost', 
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`
        },
        Oracle: {
            module: 'oracledb',
            settings: `repository: { 
        type: 'oracle', 
        host: 'localhost', 
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true, 
    },`
        }
    };

    if (repository !== 'None') {
        modules.push(repositoryConfigs[repository].module);
        otherSettings += repositoryConfigs[repository].settings;
    }

    console.log('✅ Database settings created.');

    // Configure View
    if (view.includes('Vue3')) {
        modules.push('vue@3');
        viewSettings += 'vue3: true,\n';
        await copyTemplateToProject('tsconfig.vue.json', path.join(projectPath, 'tsconfig.vue.json'));

        if (vite) {
            devModules.push('@vitejs/plugin-vue', '@vitejs/plugin-vue-jsx');
        }

        console.log('✅ Created Vue3 settings.');
    } else {
        modules.push('@cmmv/reactivity');
        devModules.push('@cmmv/plugin-vite');
        console.log('✅ Created Reactivity settings.');
    }

    // Configure TailwindCSS
    if (view.includes('TailwindCSS')) {
        devModules.push('tailwindcss');
        viewSettings += 'tailwind: true\n';

        await fs.writeFile(
            path.join(projectPath, 'tailwind.config.ts'),
            `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./**/*.{vue,js,ts,jsx,tsx}'],
    theme: { extend: {} },
    plugins: [],
};`
        );

        await fs.writeFile(
            path.join(publicPath, 'tailwind.css'),
            `@tailwind base;
@tailwind components;
@tailwind utilities;`
        );

        console.log('✅ Created TailwindCSS settings.');
    }

    // Configure Prettier
    if (prettier) {
        devModules.push('prettier', 'prettier-plugin-tailwindcss');
        await copyTemplateToProject('.prettierignore', path.join(projectPath, '.prettierignore'));
        await copyTemplateToProject('.prettierrc', path.join(projectPath, '.prettierrc'));
        console.log('✅ Prettier configured with TailwindCSS support.');
    }

    // FormBuilder configuration
    if (formbuilder) {
        modules.push('@vueform/vueform', '@vueform/plugin-mask', 'datatables.net-dt', 'datatables.net-select', 'datatables.net-select-dt', 'datatables.net-vue3', 'sass-embedded', 'vue-i18n', 'vue-router');
        devModules.push('postcss-nesting', 'postcss', 'sass', 'terser');

        await copyTemplateToProject('vueform.config.ts', path.join(projectPath, 'vueform.config.ts'));
        await copyTemplateToProject('vite.config-formbuilder.mts', path.join(projectPath, 'vite.config.mts'));

        if (fs.existsSync(path.join(projectPath, 'vite.config.js'))) {
            fs.unlinkSync(path.join(projectPath, 'vite.config.js'));
        }

        console.log('✅ FormBuilder configured with Vue3 + TailwindCSS support.');
    }

    // Generate CMMV config
    let configContent = await fs.readFile(
        path.join(__dirname, 'templates', '.cmmv.config.js'),
        'utf-8'
    );
    configContent = configContent.replace('//%VIEWSETTINGS%', viewSettings).replace('//%OTHERSETTINGS%', otherSettings);
    await fs.writeFile(configPath, configContent, 'utf-8');
    console.log('✅ Created .cmmv.config.js.');

    // Create package.json
    const packageJsonContent = {
        name: projectName,
        version: '0.0.1',
        description: '',
        author: 'Your name',
        scripts: {
            dev: vite ? 'NODE_ENV=dev concurrently "nodemon" "vite dev"' : 'NODE_ENV=dev nodemon',
            build: vite ? 'concurrently "tsc" "vite build"' : 'tsc',
            start: vite ? 'NODE_ENV=prod concurrently "node dist/server.js" "node dist/client.js"' : 'node dist/server.js',
            test: vitest ? 'vitest' : ''
        }
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 2), 'utf-8');
    console.log('✅ Created package.json.');

    // src/server.ts
    const serverContent = `import 'reflect-metadata';

import { Application } from '@cmmv/core';
import { DefaultAdapter, DefaultHTTPModule } from '@cmmv/http';
${rpc ? `import { ProtobufModule } from '@cmmv/protobuf';\nimport { WSModule, WSAdapter } from '@cmmv/ws';` : ""}
import { ViewModule, VueTranspile } from '@cmmv/view';
import { RepositoryModule, Repository } from '@cmmv/repository';
${cache ? "import { CacheModule, CacheService } from '@cmmv/cache';" : ''}

import { ApplicationModule } from './app.module';

Application.create({
    httpAdapter: DefaultAdapter,
    wsAdapter: ${rpc ? 'WSAdapter' : 'null'},
    modules: [
        DefaultHTTPModule,
        ${rpc ? 'ProtobufModule,\nWSModule,' : ''}
        ViewModule,
        RepositoryModule,
        ${cache ? "CacheModule," : ''}
        ApplicationModule,
    ],
    services: [Repository${cache ? ", CacheService" : ''}],
    transpilers: [${view === 'Vue3' || view === 'Vue3 + TailwindCSS' ? "VueTranspile" : ''}],
    contracts: [],
});`;

    await fs.writeFile(path.join(srcPath, 'server.ts'), serverContent, 'utf-8');
    await copyTemplateToProject("app.module.ts", path.join(srcPath, 'app.module.ts'));
    console.log('✅ Created src/server.ts');

    // public/client.ts
    const clientIndex = formbuilder ? 'client-formbuilder.ts' : 'client.ts';
    await copyTemplateToProject(clientIndex, path.join(publicPath, 'client.ts'));
    console.log('✅ Created public/client.ts');

    const spinner = ora('Installing dependencies...').start();

    try {
        await execa('pnpm', ['add', '-D', ...devModules], { cwd: projectPath });
        await execa('pnpm', ['add', ...modules], { cwd: projectPath });
        spinner.succeed('✅ Installed dependencies.');
    } catch (error) {
        spinner.fail('❌ Failed to install dependencies.');
        throw error; // Re-throw the error for additional handling
    }
};
