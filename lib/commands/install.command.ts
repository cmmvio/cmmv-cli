import inquirer from 'inquirer';

import {
    installModuleAction
} from '../actions/install.action.js';

export const installModules = async (args) => {
    console.log(`✨ Welcome to the CMMV ✨`);

    const { manager, additionalModules } = await inquirer.prompt([
        {
            type: 'list',
            name: 'manager',
            message: '🗄️ Select package manager:',
            choices: ['pnpm', 'yarn', 'npm'],
            default: 'pnpm',
        },
        {
            type: 'checkbox',
            name: 'additionalModules',
            message: '📦 Select additional modules to include:',
            choices: [
                { name: 'Auth', value: 'auth' },
                { name: 'Cache', value: 'cache' },
                { name: 'Email (Beta)', value: 'email' },
                { name: 'Elastic (Beta)', value: 'elastic' },
                { name: 'Encryptor', value: 'encryptor' },
                { name: 'Events', value: 'events' },
                { name: 'Inspector', value: 'inspector' },
                { name: 'Normalizer', value: 'normalizer' },
                { name: 'Queue', value: 'queue' },
                { name: 'Scheduling', value: 'scheduling' },
                { name: 'Vault', value: 'vault' },
                { name: 'GraphQL (Beta)', value: 'graphql' },
                { name: 'OpenAPI (Beta)', value: 'openapi' },
                { name: 'Parallel (Beta)', value: 'parallel' },
                { name: 'Repository', value: 'repository' },
                { name: 'Sandbox (Beta)', value: 'sandbox' },
                { name: 'Testing', value: 'testing' },
                { name: 'WebSocket', value: 'ws' },
                { name: 'Protobuf', value: 'protobuf' },
                { name: 'Model Context Protocol (Beta)', value: 'mcp' },
            ],
        }
    ]);

    console.log(`\n🚀 Initializing modules...`);

    try {
        await installModuleAction({ manager, additionalModules });
        console.log(`\n🎉 Modules installed successfully!`);
    } catch (error) {
        console.log(error);
        console.error(`❌ Error installing modules: ${error.message}`);
        console.log(
            `\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`,
        );
    }
};