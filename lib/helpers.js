import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import ora from 'ora';
import { fileURLToPath } from 'url';
import templates from './templates.cjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyTemplateToProject(templateName, finalPath) {
    const sourcePath = path.join(__dirname, 'templates', templateName);

    if(fs.existsSync(sourcePath)){
        const templateContent = await fs.readFile(
            sourcePath,
            'utf-8'
        );
        await fs.writeFile(finalPath, templateContent);
    }
    else if(templates[templateName]){
        await fs.writeFile(finalPath, templates[templateName]);
    }
    else {
        throw new Error(`File ${templateName} not exists`);
    }
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
    formbuilder,
    additionalModules = []
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

    if (additionalModules.includes('inspector')) {
        modules.push('@cmmv/inspector');
        console.log('✅ Added Inspector module.');
    }
    if (additionalModules.includes('cache') && !cache) {
        modules.push('@cmmv/cache', '@tirke/node-cache-manager-ioredis', 'cache-manager');
        devModules.push('@types/cache-manager')
        console.log('✅ Added Cache module.');
    }
    if (additionalModules.includes('auth')) {
        modules.push('@cmmv/auth', 'jsonwebtoken');
        console.log('✅ Added Auth module.');
    }
    if (additionalModules.includes('encryptor')) {
        modules.push('@cmmv/encryptor', 'elliptic', 'tiny-secp256k1', 'bip32', 'bip39', 'bs58');
        console.log('✅ Added Encryptor module.');
    }
    if (additionalModules.includes('keyv')) {
        modules.push('@cmmv/keyv', 'keyv', '@keyv/compress-gzip', '@keyv/redis');
        devModules.push('@types/keyv')
        console.log('✅ Added Keyv module.');
    }
    if (additionalModules.includes('scheduling')) {
        modules.push('@cmmv/scheduling', 'cron');
        console.log('✅ Added Scheduling module.');
    }
    if (additionalModules.includes('queue')) {
        modules.push('@cmmv/queue', "amqp-connection-manager");
        console.log('✅ Added Queue module.');
    }
    if (additionalModules.includes('normalizer')) {
        modules.push('@cmmv/normalizer');
        console.log('✅ Added Normalizer module.');
    }
    if (additionalModules.includes('elastic')) {
        modules.push('@cmmv/elastic', "@elastic/elasticsearch");
        console.log('✅ Added Elastic module.');
    }

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
        otherSettings += `    rpc: {
        enabled: true,
        preLoadContracts: true,
    },\n`;

        await copyTemplateToProject('protobuf.min.js', path.join(projectPath, 'public/assets/protobuf.min.js'));
    }

    // Configure Cache
    if (cache) {
        modules.push('@cmmv/cache', '@tirke/node-cache-manager-ioredis');
        otherSettings += `    cache: {
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
        username: 'postgres',
        password: 'postgres',
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
        viewSettings += '        vue3: true,\n';
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
        viewSettings += '        tailwind: true\n';

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
    else if(vite) {
        await copyTemplateToProject('vite.config.js', path.join(projectPath, 'vite.config.mjs'));
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

export const configureModule = async ({
    moduleName, eslint, prettier, vitest, 
    additionalModules, release, author 
}) => {
    const modulePath = path.resolve(process.cwd(), moduleName);
    const packageJsonPath = path.join(modulePath, 'package.json');
    const srcPath = path.join(modulePath, 'src');

    await fs.mkdir(path.join(modulePath), { recursive: true });
    await fs.mkdir(path.join(modulePath, "src"), { recursive: true });
    await fs.mkdir(path.join(modulePath, "scripts"), { recursive: true });
    await fs.mkdir(path.join(modulePath, "tests"), { recursive: true });

    await copyTemplateToProject('.gitignore', path.join(modulePath, ".gitignore"));
    await copyTemplateToProject('.npmignore', path.join(modulePath, ".npmignore"));
    await copyTemplateToProject('.swcrc', path.join(modulePath, ".swcrc"));
    await copyTemplateToProject('tsconfig.build.json', path.join(modulePath, "tsconfig.json"));
    await copyTemplateToProject('tsconfig.cjs.json', path.join(modulePath, "tsconfig.cjs.json"));
    await copyTemplateToProject('tsconfig.esm.json', path.join(modulePath, "tsconfig.esm.json"));

    // Create package.json
    const packageJsonContent = {
        name: moduleName,
        version: '0.0.1',
        description: '',
        keywords: [],
        author: author,
        "publishConfig": {
            "access": "public"
        },
        "engines": {
            "node": ">= 18.18.0 || >= 20.0.0"
        },
        scripts: {
            "build:cjs": "tsc --project tsconfig.cjs.json",
            "build:esm": "tsc --project tsconfig.esm.json",
            "build": "npm run build:cjs && npm run build:esm",
            "test": vitest ? "vitest" : "",
            "prepare": "husky",
            "lint": "pnpm run lint:spec",
            "lint:fix": "pnpm run lint:spec -- --fix"
        }
    };

    if(release){
        await copyTemplateToProject('release.js', path.join(modulePath, "scripts", "release.js"))
        packageJsonContent.scripts['release'] = "node scripts/release.js";
        packageJsonContent.scripts['changelog'] = "conventional-changelog -p angular -i CHANGELOG.md -s";
    }

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJsonContent, null, 4), 'utf-8');
    console.log('✅ Created package.json.');

    const modules = [
        "@cmmv/core"
    ];

    const devModules = [
        "@commitlint/cli",
        "@commitlint/config-angular",
        "@commitlint/config-conventional",
        "@swc-node/core",
        "@swc-node/register",
        "@swc/core",
        "@swc/helpers",
        "@types/node",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
        "chalk",
        "conventional-changelog",
        "conventional-changelog-cli",
        "enquirer",
        "esbuild",
        "esbuild-register",
        "execa",
        "husky",
        "lint-staged",
        "semver",
        "tslib",
        "typescript"
    ];

    if(eslint){
        devModules.push("eslint-config-prettier", "eslint-plugin-import")
    }

    if(prettier){
        devModules.push("prettier");
        await copyTemplateToProject('.prettierignore', path.join(modulePath, '.prettierignore'));
        await copyTemplateToProject('.prettierrc', path.join(modulePath, '.prettierrc'));
    }

    if(vitest){
        devModules.push("vitest")
    }

    if (additionalModules.includes('core')) {
        modules.push('@cmmv/core');
        console.log('✅ Added Core module.');
    }
    if (additionalModules.includes('http')) {
        modules.push('@cmmv/http');
        console.log('✅ Added HTTP module.');
    }
    if (additionalModules.includes('encryptor')) {
        modules.push('@cmmv/encryptor');
        console.log('✅ Added Encryptor module.');
    }

    //src/index.ts
    await fs.writeFile(path.join(srcPath, 'index.ts'), "//Good work =)", 'utf-8');
    console.log('✅ Created src/index.ts');

    const spinner = ora('Installing dependencies...').start();

    try {
        await execa('pnpm', ['add', '-D', ...devModules], { cwd: modulePath });
        await execa('pnpm', ['add', ...modules], { cwd: modulePath });
        spinner.succeed('✅ Installed dependencies.');
    } catch (error) {
        spinner.fail('❌ Failed to install dependencies.');
        throw error; // Re-throw the error for additional handling
    }
}