#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
    createProject,
    createModule,
    execDevMode,
    execBuild
} from '../lib/commands/index.js';

/*
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
};*/

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
        'module <moduleName>',
        'Create a new CMMV module',
        yargs => {
            return yargs
                .positional('moduleName', {
                    type: 'string',
                    describe: 'Name of the module',
                    demandOption: true,
                })
                .option('manager', {
                    type: 'string',
                    describe: 'Package manager',
                    default: 'pnpm',
                })
        },
        argv => {
            if (!argv.moduleName) {
                console.error('❌ Error: You must provide a module name.');
                process.exit(1);
            }

            createModule(argv);
        }
    )
    .command(
        'dev',
        'Run application in dev mode',
        yargs => {
            return yargs
                .option('pathMain', {
                    type: 'string',
                    describe: 'Path to main.ts',
                    default: "./src/main.ts"
                })
                .option('tsConfigPath', {
                    type: 'string',
                    describe: 'Path to tsconfig.json',
                    default: "./tsconfig.json"
                })
                .option('packagePath', {
                    type: 'string',
                    describe: 'Path to package.json',
                    default: "./package.json"
                })
                .option('watch', {
                    type: 'boolean',
                    describe: 'Watch mode',
                    default: true,
                })
                .option('debug', {
                    type: 'boolean',
                    describe: 'Debug informations',
                    default: false,
                })
        },
        execDevMode
    )
    .command(
        'build',
        'Run build application',
        yargs => {
            return yargs
                .option('mode', {
                    type: 'string',
                    describe: 'Build mode: tsc (TypeScript Compiler) or swc (Speedy Web Compiler)',
                    choices: ['tsc', 'swc'],
                    default: 'tsc'
                })
                .option('basePath', {
                    type: 'string',
                    describe: 'Path to source files',
                    default: "./src"
                })
                .option('outPath', {
                    type: 'string',
                    describe: 'Path to out files',
                    default: "./dist"
                })
                .option('tsConfigPath', {
                    type: 'string',
                    describe: 'Path to tsconfig.json',
                    default: "./tsconfig.json"
                })
                .option('packagePath', {
                    type: 'string',
                    describe: 'Path to package.json',
                    default: "./package.json"
                })
                .option('watch', {
                    type: 'boolean',
                    describe: 'Watch mode',
                    default: true,
                })
                .option('debug', {
                    type: 'boolean',
                    describe: 'Debug informations',
                    default: false,
                })
        },
        execBuild
    )
    /*
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
    )*/
    .demandCommand(1, 'You need to provide a valid command')
    .help()
    .argv;
