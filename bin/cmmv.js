#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import inquirer from 'inquirer';

import { 
    configureModule,
    configureContract, configureTesting
 } from '../lib/helpers.js';

import {
    createProject
} from '../lib/create-project.command.js';

const createModule = async (args) => {
    console.log(`✨ Welcome to the CMMV Project Initializer! ✨`);

    const { 
        manager, moduleName, additionalModules, author,
        eslint, prettier, vitest, release
    } = await inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: '🗄️ Select package manager:',
            choices: ['pnpm', 'yarn', 'npm'],
            default: 'pnpm',
        },
        {
            type: 'input',
            name: 'moduleName',
            message: '📦 Enter the module name:',
            default: args.moduleName,
        },
        {
            type: 'input',
            name: 'author',
            message: '✍️ Enter author name:',
            default: args.author,
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
            default: args.eslint,
        },
        {
            type: 'confirm',
            name: 'prettier',
            message: '🖌️ Add Prettier?',
            default: args.prettier,
        },
        {
            type: 'confirm',
            name: 'release',
            message: '✨ Add Release Script?',
            default: args.release,
        },
    ]);

    console.log(`\n🚀 Initializing module "${moduleName}"...`);

    try {
        await configureModule({ 
            manager, moduleName, eslint, prettier, vitest, 
            additionalModules, release, author
        });

        console.log(`\n🎉 Module "${moduleName}" created successfully!`);
        console.log(`\n✨ To get started:\n   📂 cd ${moduleName}\n   ▶️  ${manager} run build`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating module: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
};

const createContract = async (args) => {
    console.log(`✨ Welcome to the CMMV Contract Generator! ✨`);

    const contractOptions = await inquirer.prompt([
        {
            type: 'input',
            name: 'controllerName',
            message: '📂 Enter the controller name:',
            default: args.controllerName || 'MyController',
        },
        {
            type: 'input',
            name: 'protoPath',
            message: '📜 Enter the proto file path:',
            default: args.protoPath || `src/protos/${args.controllerName?.toLowerCase()}.proto`,
        },
        {
            type: 'input',
            name: 'protoPackage',
            message: '📦 Enter the proto package name:',
            default: args.protoPackage || args.controllerName?.toLowerCase(),
        },
        {
            type: 'confirm',
            name: 'generateController',
            message: '🚀 Generate a controller?',
            default: args.generateController,
        },
        {
            type: 'confirm',
            name: 'generateEntities',
            message: '💾 Generate entities?',
            default: args.generateEntities,
        },
        {
            type: 'checkbox',
            name: 'imports',
            message: '📦 Select imports for the contract:',
            choices: ['crypto'],
            default: args.imports || [],
        },
        {
            type: 'confirm',
            name: 'enableCache',
            message: '🧳 Enable cache?',
            default: args.enableCache,
        },
    ]);

    let cacheOptions = {};

    if (contractOptions.enableCache) {
        cacheOptions = await inquirer.prompt([
            {
                type: 'input',
                name: 'key',
                message: '🔑 Enter cache key prefix:',
                default: args.cacheKey || `${contractOptions.controllerName.toLowerCase()}:`,
            },
            {
                type: 'number',
                name: 'ttl',
                message: '⏳ Enter cache TTL (seconds):',
                default: args.cacheTTL || 300,
            },
            {
                type: 'confirm',
                name: 'compress',
                message: '📦 Enable compression?',
                default: args.cacheCompress || true,
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
                default: '',
            },
            {
                type: 'list',
                name: 'protoType',
                message: '📜 Select proto type:',
                choices: ['string', 'bool', 'int32', 'int64', 'double', 'float', 'date', 'bytes'],
                default: 'string',
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
            fields,
        });

        console.log(`\n🎉 Contract "${contractOptions.controllerName}" created successfully!`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating contract: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
};

const createTesting = async (args) => {
    console.log(`✨ Welcome to the CMMV Testing Generator! ✨`);

    const { testingName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'testingName',
            message: '📂 Enter the testing name:',
            default: args.testingName || 'mytest',
        },
    ]);

    console.log(`\n🚀 Initializing testing "${testingName}"...`);

    try {
        await configureTesting({ testingName });

        console.log(`\n🎉 Testing "${testingName}" created successfully!`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating testing: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
};

yargs(hideBin(process.argv))
    .command(
        'create <projectName>',
        'Create a new CMMV project',
        yargs => {
            return yargs
                .positional('projectName', {
                    type: 'string',
                    describe: 'Name of the project',
                    demandOption: true,
                })
                .option('manager', {
                    type: 'string',
                    describe: 'Package manager',
                    default: 'pnpm',
                })
                .option('rpc', {
                    type: 'boolean',
                    describe: 'Enable RPC',
                    default: true,
                })
                .option('repository', {
                    type: 'string',
                    choices: ['none', 'sqlite', 'mongodb', 'postgresql', 'mysql', 'mssql', 'oracle'],
                    describe: 'Repository type',
                    default: 'none',
                })
                .option('cache', {
                    type: 'string',
                    choices: ['none', 'redis', 'memcached', 'mongodb', 'filesystem'],
                    describe: 'Cache type',
                    default: 'none',
                })
                .option('queue', {
                    type: 'string',
                    choices: ['none', 'redis', 'rabbitmq', 'kafka'],
                    describe: 'Queue type',
                    default: 'none',
                })
                .option('vitest', {
                    type: 'boolean',
                    describe: 'Add Vitest',
                    default: true,
                });
        },
        argv => {
            if (!argv.projectName) {
                console.error('❌ Error: You must provide a project name.');
                process.exit(1);
            }

            createProject(argv);
        }
    )
    .command(
        'module',
        'Create a new CMMV module',
        {
            manager: {
                type: 'string',
                describe: 'Package manager',
                default: 'pnpm',
            },
            moduleName: {
                type: 'string',
                describe: 'Name of the module',
                default: 'my-module',
            },
            author: {
                type: 'string',
                describe: 'Author of the module',
                default: 'Anonymous',
            },
            eslint: {
                type: 'boolean',
                describe: 'Add Eslint',
                default: true,
            },
            prettier: {
                type: 'boolean',
                describe: 'Add Prettier',
                default: true,
            },
            vitest: {
                type: 'boolean',
                describe: 'Add Vitest',
                default: true,
            },
            release: {
                type: 'boolean',
                describe: 'Add Release Script',
                default: true,
            },
        },
        createModule
    )
    .command(
        'contract',
        'Create a new CMMV contract',
        {
            controllerName: {
                type: 'string',
                describe: 'Name of the controller',
                default: 'MyController',
            },
            protoPath: {
                type: 'string',
                describe: 'Path to the proto file',
                default: 'src/protos/mycontroller.proto',
            },
            protoPackage: {
                type: 'string',
                describe: 'Proto package name',
                default: 'mycontroller',
            },
            generateController: {
                type: 'boolean',
                describe: 'Generate a controller',
                default: true,
            },
            generateEntities: {
                type: 'boolean',
                describe: 'Generate entities',
                default: true,
            },
            enableCache: {
                type: 'boolean',
                describe: 'Enable cache',
                default: false,
            },
        },
        createContract
    )
    .command(
        'testing',
        'Create a new CMMV testing file',
        {
            testingName: {
                type: 'string',
                describe: 'Name of the testing file',
                default: 'mytest',
            },
        },
        createTesting
    )
    .demandCommand(1, 'You need to provide a valid command')
    .help()
    .argv;
