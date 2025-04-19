import * as fs from 'node:fs';
import * as path from 'node:path';
import { execa } from 'execa';

export const configureModule = async ({
    manager,
    moduleName,
    additionalModules = []
}: {
    manager: string,
    moduleName: string,
    additionalModules: Array<string>
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

    if (additionalModules.includes('auth')) {
        modules.push('@cmmv/auth');
        console.log('✔ Added Auth module.');
    }

    if (additionalModules.includes('email')) {
        modules.push('@cmmv/email');
        console.log('✔ Added Email module.');
    }

    if (additionalModules.includes('vault')) {
        modules.push('@cmmv/vault');
        console.log('✔ Added Vault module.');
    }

    if (additionalModules.includes('queue')) {
        modules.push('@cmmv/queue');
        console.log('✔ Added Queue module.');
    }

    if (additionalModules.includes('repository')) {
        modules.push('@cmmv/repository');
        console.log('✔ Added Repository module.');
    }

    console.log('Installing dependencies...');

    try {
        await execa(manager, ['add', ...modules], { cwd: modulePath });
    } catch (error) {
        throw error;
    }
};
