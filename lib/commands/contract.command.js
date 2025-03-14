import inquirer from 'inquirer';

import { configureContract } from '../actions/index.js';

export const createContract = async (args) => {
    console.log(`✨ Welcome to the CMMV ✨`);

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
            default:
                args.protoPath ||
                `src/protos/${args.controllerName?.toLowerCase()}.proto`,
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
                default:
                    args.cacheKey || `${contractOptions.controllerName.toLowerCase()}:`,
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
                choices: [
                    'string',
                    'bool',
                    'int32',
                    'int64',
                    'double',
                    'float',
                    'date',
                    'bytes',
                ],
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

                addValidation = (
                    await inquirer.prompt({
                        type: 'confirm',
                        name: 'addMore',
                        message: '➕ Add another validation?',
                        default: false,
                    })
                ).addMore;
            }
        }

        fields.push(field);

        addField = (
            await inquirer.prompt({
                type: 'confirm',
                name: 'addAnotherField',
                message: '➕ Add another field?',
                default: true,
            })
        ).addAnotherField;
    }

    console.log(
        `\n🚀 Initializing contract "${contractOptions.controllerName}"...`,
    );

    try {
        await configureContract({
            contractOptions,
            cacheOptions,
            fields,
        });

        console.log(
            `\n🎉 Contract "${contractOptions.controllerName}" created successfully!`,
        );
        console.log(
            `\n📖 For more information and documentation, visit: https://cmmv.io/docs`,
        );
    } catch (error) {
        console.error(`❌ Error creating contract: ${error.message}`);
        console.log(
            `\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`,
        );
    }
};
