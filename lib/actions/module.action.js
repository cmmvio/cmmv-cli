import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { execa } from 'execa';

export const configureModule = async ({
    manager,
    moduleName,
    additionalModules = [],
}) => {
    const cwdPath = path.resolve(process.cwd());
    const modulePath = path.resolve(process.cwd(), moduleName);

    await execa(
        'git',
        ['clone', 'https://github.com/cmmvio/typescript-module', moduleName],
        { cwd: cwdPath },
    );

    await fs.rmSync(path.join(modulePath, '.git'), {
        recursive: true,
        force: true,
    });

    const modules = ['@cmmv/core'];

    if (additionalModules.includes('http')) {
        modules.push('@cmmv/http');
        console.log('✔ Added HTTP module.');
    }

    if (additionalModules.includes('encryptor')) {
        modules.push('@cmmv/encryptor');
        console.log('✔ Added Encryptor module.');
    }

    const spinner = ora('Installing dependencies...').start();

    try {
        await execa(manager, ['add', ...modules], { cwd: modulePath });
        spinner.succeed('Installed dependencies.');
    } catch (error) {
        spinner.fail('❌ Failed to install dependencies.');
        throw error;
    }
};
