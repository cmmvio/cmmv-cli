import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@cmmv/core';

import chalk from 'chalk';
import enquirer from 'enquirer';
import semver from 'semver';
import { execa } from 'execa';

const { prompt } = enquirer;

import { run } from '../utils/exec.util.js';

// Define interfaces for prompt responses
interface ReleasePromptResponse {
  release: string;
}

interface VersionPromptResponse {
  version: string;
}

interface ConfirmPromptResponse {
  yes: boolean;
}

export const releaseScript = async (args: any) => {
    const logger = new Logger('CLI');
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
    const packagePath = path.resolve(process.cwd(), args.packagePath);

    if (!fs.existsSync(packagePath)) {
        logger.error('package.json not found!');
        return;
    }

    if (!fs.existsSync(tsConfigPath)) {
        logger.error('tsconfig.json not found!');
        return;
    }

    //Build project
    await run(args.manager, ['run', 'build', '--debug', args.debug || true], {
        env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
        stdio: 'inherit',
    }, true);

    const currentVersion = JSON.parse(
        fs.readFileSync(packagePath, 'utf-8'),
    ).version;
    const versionIncrements = ['patch', 'minor', 'major'];

    const inc = (i: string) => semver.inc(currentVersion, i as semver.ReleaseType);
    const step = (msg: string) => console.log(chalk.cyan(msg));

    let targetVersion: string;

    try {
        // Prompt release type
        const { release } = await prompt<ReleasePromptResponse>({
            type: 'select',
            name: 'release',
            message: 'Select release type:',
            choices: versionIncrements
                .map((i) => `${i} (${inc(i)})`)
                .concat(['custom']),
        });

        if (release === 'custom') {
            const { version } = await prompt<VersionPromptResponse>({
                type: 'input',
                name: 'version',
                message: 'Input custom version:',
                initial: currentVersion,
            });
            targetVersion = version;
        } else {
            const match = release.match(/\((.*)\)/);
            targetVersion = match ? match[1] : release;
        }

        if (!semver.valid(targetVersion))
            throw new Error(`Invalid target version: ${targetVersion}`);

        // Confirm release
        const { yes: tagOk } = await prompt<ConfirmPromptResponse>({
            type: 'confirm',
            name: 'yes',
            message: `Releasing v${targetVersion}. Confirm?`,
        });

        if (!tagOk) {
            console.log(chalk.yellow('Release canceled.'));
            return;
        }

        // Update the package version
        step('\nUpdating the package version...');
        updatePackage(targetVersion);

        // Generate the changelog
        step('\nGenerating the changelog...');
        await run('pnpm', ['run', 'changelog'], true);

        const { yes: changelogOk } = await prompt<ConfirmPromptResponse>({
            type: 'confirm',
            name: 'yes',
            message: `Changelog generated. Does it look good?`,
        });

        if (!changelogOk) {
            console.log(chalk.yellow('Release canceled after changelog review.'));
            return;
        }

        // Commit changes and create a Git tag
        step('\nCommitting changes...');
        await run('git', ['add', 'CHANGELOG.md', 'package.json'], true);
        await run('git', ['commit', '-m', `release: v${targetVersion}`], true);
        await run('git', ['tag', `v${targetVersion}`], true);

        // Publish the package
        step('\nPublishing the package...');
        await run('pnpm', ['publish', '--access', 'public'], true);

        // Push changes to GitHub
        step('\nPushing to GitHub...');
        await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`], true);
        await run('git', ['push'], true);

        console.log(chalk.green(`\nSuccessfully released v${targetVersion}!`));
    } catch (err: any) {
        console.error(chalk.red(`\nAn error occurred during the release process:`));
        console.error(err.message);
        process.exit(1);
    }
};

function updatePackage(version: string): void {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    pkg.version = version;

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    console.log(`Updated package.json version to ${version}`);
}
