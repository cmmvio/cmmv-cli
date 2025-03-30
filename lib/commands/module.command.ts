import inquirer from 'inquirer';

import { configureModule } from '../actions/module.action.js';

export const createModule = async (args) => {
    console.log(`✨ Welcome to the CMMV ✨`);

    const { manager, moduleName, additionalModules } = await inquirer.prompt([
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
            type: 'checkbox',
            name: 'additionalModules',
            message: '📦 Select additional modules to include:',
            choices: [
                { name: 'Core', value: 'core', 'checked': true },
                { name: 'Http', value: 'http' },
                { name: 'Encryptor', value: 'encryptor' },
                { name: 'Auth', value: 'auth' },
                { name: 'Email', value: 'email' },
                { name: 'Vault', value: 'vault' },
                { name: 'Queue', value: 'queue' },
                { name: 'Repository', value: 'repository' }
            ],
        },
    ]);

    console.log(`\n🚀 Initializing module "${moduleName}"...`);

    try {
        await configureModule({
            manager,
            moduleName,
            additionalModules,
        });

        console.log(`\n🎉 Module "${moduleName}" created successfully!`);
        console.log(
            `\n✨ To get started:\n   📂 cd ${moduleName}\n   ▶️  ${manager} build`,
        );
        console.log(
            `\n📖 For more information and documentation, visit: https://cmmv.io/docs`,
        );
    } catch (error) {
        console.error(`❌ Error creating module: ${error.message}`);
        console.log(
            `\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`,
        );
    }
};