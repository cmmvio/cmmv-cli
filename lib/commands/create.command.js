import inquirer from 'inquirer';

import {
    configureProject
} from '../actions/create.action.js';

export const createProject = async (args) => {
    console.log(`✨ Welcome to the CMMV ✨`);

    const {
        manager,
        projectName,
        sandbox,
        rpc,
        cache,
        repository,
        queue,
        additionalModules,
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
            name: 'projectName',
            message: '📦 Enter the project name:',
            default: args.projectName,
        },
        {
            type: 'confirm',
            name: 'sandbox',
            message: '🛠️ Enable Sandbox (Beta)?',
            default: true
        },
        {
            type: 'confirm',
            name: 'rpc',
            message: '🔌 Enable RPC (WebSocket)?',
            default: args.rpc
        },
        {
            type: 'list',
            name: 'repository',
            message: '🗄️ Select repository type:',
            choices: [
                'None',
                'Sqlite',
                'MongoDB',
                'PostgreSQL',
                'MySQL',
                'MsSQL',
                'Oracle',
            ],
            default: args.repository,
        },
        {
            type: 'list',
            name: 'cache',
            message: '🧳 Select cache type:',
            choices: ['None', 'Redis', 'Memcached', 'MongoDB', 'Filesystem'],
            default: args.cache,
        },
        {
            type: 'list',
            name: 'queue',
            message: '📨 Select queue type:',
            choices: ['None', 'Redis', 'RabbitMQ', 'Kafka'],
            default: args.queue,
        },
        {
            type: 'checkbox',
            name: 'additionalModules',
            message: '📦 Select additional modules to include:',
            choices: [
                { name: 'Auth', value: 'auth' },
                { name: 'Email (Beta)', value: 'email' },
                { name: 'Elastic (Beta)', value: 'elastic' },
                { name: 'Encryptor', value: 'encryptor' },
                { name: 'Events', value: 'events' },
                { name: 'Inspector', value: 'inspector' },
                { name: 'Normalizer', value: 'normalizer' },
                { name: 'Queue', value: 'queue' },
                { name: 'Scheduling', value: 'scheduling' },
                { name: 'Vault', value: 'vault' },
                { name: 'GraphQL', value: 'graphql' },
                { name: 'OpenAPI', value: 'openapi' },
            ],
        },
        {
            type: 'confirm',
            name: 'vitest',
            message: '🧪 Add Vitest?',
            default: args.vitest,
        },
    ]);

    console.log(`\n🚀 Initializing project "${projectName}"...`);

    try {
        await configureProject({
            manager,
            projectName,
            sandbox,
            rpc,
            cache: cache.toLowerCase(),
            repository: repository.toLowerCase(),
            queue: queue.toLowerCase(),
            additionalModules,
        });

        console.log(`\n🎉 Project "${projectName}" created successfully!`);
        console.log(
            `\n✨ To get started:\n   📂 cd ${projectName}\n   ▶️  ${manager} dev`,
        );
        console.log(
            `\n📖 For more information and documentation, visit: https://cmmv.io/docs`,
        );
    } catch (error) {
        console.log(error);
        console.error(`❌ Error creating project: ${error.message}`);
        console.log(
            `\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`,
        );
    }
};
