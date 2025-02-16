#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
    createProject,
    createModule,
    createContract,
    execDevMode,
    execBuild,
    releaseBuild
} from '../lib/commands/index.js';

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
    .command(
        'release',
        'Run release script',
        yargs => {
            return yargs
                .option('manager', {
                    type: 'string',
                    describe: 'Package manager',
                    default: 'pnpm',
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
        },
        releaseBuild
    )
    .demandCommand(1, 'You need to provide a valid command')
    .help()
    .argv;
