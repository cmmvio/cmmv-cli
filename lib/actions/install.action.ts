import * as path from 'node:path';
import { execa } from 'execa';
import ora from 'ora';

export const installModuleAction = async ({
    manager,
    additionalModules = []
}: {
    manager: string,
    additionalModules: Array<string>
}) => {
    const projectPath = path.resolve(process.cwd());

    const modules: string[] = [];

    if (additionalModules.includes('sandbox')) {
        modules.push('@cmmv/sandbox');
        console.log('✔ Added Sandbox module.');
    }

    if (additionalModules.includes('auth')) {
        modules.push('@cmmv/auth');
        console.log('✔ Added Auth module.');
    }

    if (additionalModules.includes('cache')) {
        modules.push('@cmmv/cache');
        console.log('✔ Added Cache module.');
    }

    if (additionalModules.includes('email')) {
        modules.push('@cmmv/email');
        console.log('✔ Added Email module.');
    }

    if (additionalModules.includes('elastic')) {
        modules.push('@cmmv/elastic');
        console.log('✔ Added Elastic module.');
    }

    if (additionalModules.includes('encryptor')) {
        modules.push('@cmmv/encryptor');
        console.log('✔ Added Encryptor module.');
    }

    if (additionalModules.includes('events')) {
        modules.push('@cmmv/events');
        console.log('✔ Added Events module.');
    }

    if (additionalModules.includes('inspector')) {
        modules.push('@cmmv/inspector');
        console.log('✔ Added Inspector module.');
    }

    if (additionalModules.includes('normalizer')) {
        modules.push('@cmmv/normalizer');
        console.log('✔ Added Normalizer module.');
    }

    if (additionalModules.includes('queue')) {
        modules.push('@cmmv/queue');
        console.log('✔ Added Queue module.');
    }

    if (additionalModules.includes('keyv')) {
        modules.push('@cmmv/keyv');
        console.log('✔ Added Keyv module.');
    }

    if (additionalModules.includes('scheduling')) {
        modules.push('@cmmv/scheduling');
        console.log('✔ Added Scheduling module.');
    }

    if (additionalModules.includes('vault')) {
        modules.push('@cmmv/vault');
        console.log('✔ Added Vault module.');
    }

    if (additionalModules.includes('graphql')) {
        modules.push('@cmmv/graphql');
        console.log('✔ Added GraphQL module.');
    }

    if (additionalModules.includes('openapi')) {
        modules.push('@cmmv/openapi');
        console.log('✔ Added OpenAPI module.');
    }

    if (additionalModules.includes('parallel')) {
        modules.push('@cmmv/parallel');
        console.log('✔ Added Parallel module.');
    }

    if (additionalModules.includes('repository')) {
        modules.push('@cmmv/repository');
        console.log('✔ Added Repository module.');
    }

    if (additionalModules.includes('testing')) {
        modules.push('@cmmv/testing');
        console.log('✔ Added Testing module.');
    }

    if (additionalModules.includes('ws')) {
        modules.push('@cmmv/ws');
        console.log('✔ Added WebSocket module.');
    }

    if (additionalModules.includes('protobuf')) {
        modules.push('@cmmv/protobuf');
        console.log('✔ Added Protobuf module.');
    }

    const spinner = ora('Installing dependencies...').start();

    try {
        await execa(manager, ['add', ...modules], { cwd: projectPath });

        spinner.succeed('Installed dependencies.');

        if(manager === 'pnpm'){
            console.log(`\n⚠️  Manually run the following command to approve builds:`);
            console.log(`\n👉  cd ${projectPath} && pnpm approve-builds`);
        }
    } catch (error) {
        spinner.fail('❌ Failed to install dependencies.');
        throw error;
    }
};
