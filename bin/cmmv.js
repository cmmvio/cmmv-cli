#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

import { 
    configureProject, configureModule,
    configureContract
 } from '../lib/helpers.js';

const createProject = async (args) => {
    console.log(`✨ Welcome to the CMMV Project Initializer! ✨`);

    const { 
        projectName, vite, rpc, cache,
        repository, view, eslint, prettier, 
        vitest, formbuilder, additionalModules 
    } = await inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: '📦 Enter the project name:',
            default: args._[1],
        },
        {
            type: 'confirm',
            name: 'vite',
            message: '⚡ Enable Vite Middleware?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'rpc',
            message: '🔌 Enable RPC (WebSocket)?',
            default: true,
        },
        {
            type: 'list',
            name: 'repository',
            message: '🗄️ Select repository type:',
            choices: ['Sqlite', 'MongoDB', 'PostgreSQL', 'MySQL', 'MsSQL', 'Oracle'],
            default: 'Sqlite',
        },
        {
            type: 'confirm',
            name: 'cache',
            message: '🧳 Enable Cache module?',
            default: true,
        },
        {
            type: 'list',
            name: 'view',
            message: '🎨 Select View configuration:',
            choices: ['Reactivity', 'Vue3', 'Vue3 + TailwindCSS'],
            default: 'Vue3 + TailwindCSS',
        },
        /*{
            type: 'confirm',
            name: 'formbuilder',
            message: '📝 Enable FormBuilder? (Beta)',
            default: true,
        },*/
        {
            type: 'checkbox',
            name: 'additionalModules',
            message: '📦 Select additional CMMV modules to include:',
            choices: [
                { name: 'Inspector (Debug)', value: 'inspector' },
                { name: 'Cache', value: 'cache' },
                { name: 'Auth', value: 'auth' },
                { name: 'Encryptor', value: 'encryptor' },
                { name: 'Keyv', value: 'keyv' },
                { name: 'Inspector', value: 'inspector' },
                { name: 'Scheduling', value: 'scheduling' },
                { name: 'Normalizer (Beta)', value: 'normalizer' },
                { name: 'Queue (Beta)', value: 'queue' },
                { name: 'Elastic (Beta)', value: 'elastic' },
            ],
        },
        {
            type: 'confirm',
            name: 'eslint',
            message: '🔍 Add Eslint ?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'prettier',
            message: '🖌️ Add Prettier?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'vitest',
            message: '🧪 Add Vitest?',
            default: true,
        },
    ]);

    let finalView = view;
    let finalVite = vite;

    if (formbuilder && view !== 'Vue3 + TailwindCSS') {
        console.log(`\n🔧 FormBuilder requires View to be Vue3 + TailwindCSS. Adjusting configuration...`);
        finalView = 'Vue3 + TailwindCSS';
        finalVite = true;
    }

    console.log(`\n🚀 Initializing project "${projectName}"...`);

    try {
        await configureProject({ 
            projectName, vite: finalVite, rpc, cache, repository, view: finalView, 
            eslint, prettier, vitest, formbuilder, additionalModules 
        });

        console.log(`\n🎉 Project "${projectName}" created successfully!`);
        console.log(`\n✨ To get started:\n   📂 cd ${projectName}\n   ▶️  pnpm dev`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating project: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
};

const createModule = async (args) => {
    console.log(`✨ Welcome to the CMMV Project Initializer! ✨`);

    const { 
        moduleName, additionalModules, author,
        eslint, prettier, vitest, release
    } = await inquirer.prompt([
        {
            type: 'input',
            name: 'moduleName',
            message: '📦 Enter the module name:',
            default: args._[1],
        },
        {
            type: 'input',
            name: 'author',
            message: '✍️ Enter author name:',
        },
        {
            type: 'checkbox',
            name: 'additionalModules',
            message: '📦 Select additional CMMV modules to include:',
            choices: [
                { name: 'Core', value: 'core', 'checked': true },
                { name: 'Http', value: 'http' },
                { name: 'Encryptor', value: 'encryptor' },
            ],
        },
        {
            type: 'confirm',
            name: 'eslint',
            message: '🔍 Add Eslint?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'prettier',
            message: '🖌️ Add Prettier?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'vitest',
            message: '🧪 Add Vitest?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'release',
            message: '✨ Add Release Script?',
            default: true,
        },
    ]);

    console.log(`\n🚀 Initializing module "${moduleName}"...`);

    try {
        await configureModule({ 
            moduleName, eslint, prettier, vitest, 
            additionalModules, release, author
        });

        console.log(`\n🎉 Module "${moduleName}" created successfully!`);
        console.log(`\n✨ To get started:\n   📂 cd ${moduleName}\n   ▶️  pnpm build`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating module: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
}

const createContract = async (args) => {
    console.log(`✨ Welcome to the CMMV Contract Generator! ✨`);

    const contractOptions = await inquirer.prompt([
        {
            type: 'input',
            name: 'controllerName',
            message: '📂 Enter the controller name:',
            default: args._[1] || 'MyController',
        },
        {
            type: 'input',
            name: 'protoPath',
            message: '📜 Enter the proto file path:',
            default: `src/protos/${args._[1].toLowerCase()}.proto`,
        },
        {
            type: 'input',
            name: 'protoPackage',
            message: '📦 Enter the proto package name:',
            default: args._[1].toLowerCase(),
        },
        {
            type: 'confirm',
            name: 'generateController',
            message: '🚀 Generate a controller?',
            default: true,
        },
        {
            type: 'confirm',
            name: 'generateEntities',
            message: '💾 Generate entities?',
            default: true,
        },
        {
            type: 'checkbox',
            name: 'imports',
            message: '📦 Select imports for the contract:',
            choices: ['crypto'],
        },
        {
            type: 'confirm',
            name: 'enableCache',
            message: '🧳 Enable cache?',
            default: false,
        },
    ]);

    let cacheOptions = {};

    if (contractOptions.enableCache) {
        cacheOptions = await inquirer.prompt([
            {
                type: 'input',
                name: 'key',
                message: '🔑 Enter cache key prefix:',
                default: `${contractOptions.controllerName.toLowerCase()}:`,
            },
            {
                type: 'number',
                name: 'ttl',
                message: '⏳ Enter cache TTL (seconds):',
                default: 300,
            },
            {
                type: 'confirm',
                name: 'compress',
                message: '📦 Enable compression?',
                default: true,
            },
        ]);
    }

    const fields = [];
    let addField = true;

    while (addField) {
        const field = await inquirer.prompt([
            {
                type: 'input',
                name: 'name',
                message: '🛠️ Enter field name:',
            },
            {
                type: 'list',
                name: 'protoType',
                message: '📜 Select proto type:',
                choices: ['string', 'bool', 'int32', 'int64', 'double', 'float', 'date', 'bytes'],
            },
            {
                type: 'confirm',
                name: 'protoRepeated',
                message: '🔄 Is this a repeated field?',
                default: false,
            },
            {
                type: 'confirm',
                name: 'unique',
                message: '🔑 Should this field be unique?',
                default: false,
            },
            {
                type: 'confirm',
                name: 'nullable',
                message: '🗂️ Is this field nullable?',
                default: true,
            },
            {
                type: 'confirm',
                name: 'addValidations',
                message: '🛡️ Add validations to this field?',
                default: false,
            },
        ]);

        if (field.addValidations) {
            field.validations = [];
            let addValidation = true;

            while (addValidation) {
                const validation = await inquirer.prompt([
                    {
                        type: 'input',
                        name: 'type',
                        message: '🛡️ Enter validation type:',
                    },
                    {
                        type: 'input',
                        name: 'message',
                        message: '💬 Enter validation error message:',
                    },
                ]);
                field.validations.push(validation);

                addValidation = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'addMore',
                    message: '➕ Add another validation?',
                    default: false,
                })).addMore;
            }
        }

        fields.push(field);

        addField = (await inquirer.prompt({
            type: 'confirm',
            name: 'addAnotherField',
            message: '➕ Add another field?',
            default: true,
        })).addAnotherField;
    }

    console.log(`\n🚀 Initializing contract "${contractOptions.controllerName}"...`);

    try {
        await configureContract({ 
            contractOptions,
            cacheOptions,
            fields
        });

        console.log(`\n🎉 Contract "${contractOptions.controllerName}" created successfully!`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
}

yargs(hideBin(process.argv))
    .command(
        'create',
        'Create a new CMMV project',
        {
            projectName: {
                type: 'string',
                describe: 'Name of the project',
            },
            vite: {
                type: 'boolean',
                describe: 'Enable Vite Middleware',
            },
            rpc: {
                type: 'boolean',
                describe: 'Enable RPC (WebSocket)',
            },
            repository: {
                type: 'string',
                choices: ['Sqlite', 'MongoDB', 'PostgreSQL', 'MySQL', 'MsSQL', 'Oracle'],
                describe: 'Repository type',
            },
            cache: {
                type: 'boolean',
                describe: 'Enable Cache module',
            },
            view: {
                type: 'string',
                choices: ['Reactivity', 'Vue3', 'Vue3 + TailwindCSS'],
                describe: 'View configuration',
            },
            formbuilder: {
                type: 'boolean',
                describe: 'Enable FormBuilder',
            },
            additionalModules: {
                type: 'array',
                describe: 'Additional CMMV modules to include',
            },
            eslint: {
                type: 'boolean',
                describe: 'Add Eslint',
            },
            prettier: {
                type: 'boolean',
                describe: 'Add Prettier',
            },
            vitest: {
                type: 'boolean',
                describe: 'Add Vitest',
            },
        },
        createProject,
    )
    .command(
        'module',
        'Create a new CMMV module',
        { },
        createModule,
    )
    .command(
        'contract',
        'Create a new CMMV contract',
        { },
        createContract,
    )
    .demandCommand(1, 'You need to provide a valid command')
    .help()
    .argv;
