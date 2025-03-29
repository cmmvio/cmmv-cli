import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@cmmv/core';

import chalk from 'chalk';
import * as enquirer from 'enquirer';
import * as semver from 'semver';

import { run } from '../utils/exec.util.js';

export const releaseScript = async (args) => {
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
    });

    const currentVersion = JSON.parse(
        fs.readFileSync(packagePath, 'utf-8'),
    ).version;
    const versionIncrements = ['patch', 'minor', 'major'];

    const inc = (i) => semver.inc(currentVersion, i);
    const step = (msg) => console.log(chalk.cyan(msg));

    let targetVersion;

    try {
        // Prompt release type
        const result: any = await enquirer.prompt({
            type: 'select',
            name: 'release',
            message: 'Select release type:',
            choices: versionIncrements
                .map((i) => `${i} (${inc(i)})`)
                .concat(['custom']),
        });

        if (result.release === 'custom') {
            const resultVersion: any = await enquirer.prompt({
                type: 'input',
                name: 'version',
                message: 'Input custom version:',
                initial: currentVersion,
            });
            targetVersion = resultVersion.version;
        } else {
            targetVersion = result.release.match(/\((.*)\)/)[1];
        }

        if (!semver.valid(targetVersion))
            throw new Error(`Invalid target version: ${targetVersion}`);

        // Confirm release
        const resultTag: any = await enquirer.prompt({
            type: 'confirm',
            name: 'yes',
            message: `Releasing v${targetVersion}. Confirm?`,
        });

        if (!resultTag.yes) {
            console.log(chalk.yellow('Release canceled.'));
            return;
        }

        // Update the package version
        step('\nUpdating the package version...');
        updatePackage(targetVersion);

        // Generate the changelog
        step('\nGenerating the changelog...');
        await run('pnpm', ['run', 'changelog']);

        const resultChangelog: any = await enquirer.prompt({
            type: 'confirm',
            name: 'yes',
            message: `Changelog generated. Does it look good?`,
        });

        if (!resultChangelog.yes) {
            console.log(chalk.yellow('Release canceled after changelog review.'));
            return;
        }

        // Commit changes and create a Git tag
        step('\nCommitting changes...');
        await run('git', ['add', 'CHANGELOG.md', 'package.json']);
        await run('git', ['commit', '-m', `release: v${targetVersion}`]);
        await run('git', ['tag', `v${targetVersion}`]);

        // Publish the package
        step('\nPublishing the package...');
        await run('pnpm', ['publish', '--access', 'public']);

        // Push changes to GitHub
        step('\nPushing to GitHub...');
        await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
        await run('git', ['push']);

        console.log(chalk.green(`\nSuccessfully released v${targetVersion}!`));
    } catch (err) {
        console.error(chalk.red(`\nAn error occurred during the release process:`));
        console.error(err.message);
        process.exit(1);
    }
};

function updatePackage(version) {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    pkg.version = version;

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    console.log(`Updated package.json version to ${version}`);
}