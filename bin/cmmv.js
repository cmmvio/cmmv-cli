#!/usr/bin/env node

import inquirer from 'inquirer';
import { configureProject } from '../lib/helpers.js';

const run = async () => {
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
            default: 'my-cmmv-project',
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
        {
            type: 'confirm',
            name: 'formbuilder',
            message: '📝 Enable FormBuilder? (Beta)',
            default: true,
        },
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
                { name: 'Scheduling', value: 'scheduling' },
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

run();
