#!/usr/bin/env node

import inquirer from 'inquirer';
import { configureProject } from '../lib/helpers.js';

const run = async () => {
    console.log(`✨ Welcome to the CMMV Project Initializer! ✨`);

    const { projectName, vite, rpc, cache, repository, view, eslint, prettier, vitest } = await inquirer.prompt([
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
            choices: ['None', 'Sqlite', 'MongoDB', 'PostgreSQL', 'MySQL'],
            default: 'None',
        },
        {
            type: 'confirm',
            name: 'cache',
            message: '🧳 Enable Cache module?',
            default: false,
        },
        {
            type: 'list',
            name: 'view',
            message: '🎨 Select View configuration:',
            choices: ['Reactivity', 'Vue3', 'Vue3 + TailwindCSS'],
            default: 'Reactivity',
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

    console.log(`\n🚀 Initializing project "${projectName}"...`);

    try {
        await configureProject({ 
            projectName, vite, rpc, cache, repository, view, 
            eslint, prettier, vitest
        });

        console.log(`\n🎉 Project "${projectName}" created successfully!`);
        console.log(`\n✨ To get started:\n   📂 cd ${projectName}\n   ▶️ pnpm dev`);
        console.log(`\n📖 For more information and documentation, visit: https://cmmv.io/docs`);
    } catch (error) {
        console.error(`❌ Error creating project: ${error.message}`);
        console.log(`\n📖 Visit https://cmmv.io/docs for troubleshooting and detailed setup instructions.`);
    }
};

run();
