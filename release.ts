import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { Logger } from '@cmmv/core';
import chalk from 'chalk';
import semver from 'semver';
import { run } from './lib/utils/exec.util.js';

// Define argument types
interface ReleaseArgs {
    tsConfigPath: string;
    packagePath: string;
    manager: string;
    debug?: boolean;
}

// Create a Promise-based readline interface
function createPrompt(): readline.Interface {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Promise-based question function
function question(rl: readline.Interface, query: string): Promise<string> {
    return new Promise(resolve => {
        rl.question(query, answer => {
            resolve(answer);
        });
    });
}

// Select from options function
async function select(rl: readline.Interface, message: string, choices: string[]): Promise<string> {
    console.log(`${message}`);
    choices.forEach((choice, index) => {
        console.log(`  ${index + 1}) ${choice}`);
    });

    const answer = await question(rl, 'Enter your choice (number): ');
    const index = parseInt(answer) - 1;

    if (isNaN(index) || index < 0 || index >= choices.length) {
        console.log(chalk.red('Invalid selection. Please try again.'));
        return select(rl, message, choices);
    }

    return choices[index];
}

// Confirm function
async function confirm(rl: readline.Interface, message: string): Promise<boolean> {
    const answer = await question(rl, `${message} (y/n): `);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

export const releaseScript = async (args: ReleaseArgs) => {
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

    // Build project
    let buildArgs = ['run', 'build'];
    await run(args.manager, buildArgs, {
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
    const rl = createPrompt();

    try {
        // Prompt release type
        const choices = [
            ...versionIncrements.map(i => `${i} (${inc(i)})`),
            'custom'
        ];

        const release = await select(rl, 'Select release type:', choices);

        if (release === 'custom') {
            targetVersion = await question(rl, `Input custom version [${currentVersion}]: `);
            if (!targetVersion) targetVersion = currentVersion;
        } else {
            const match = release.match(/\((.*)\)/);
            targetVersion = match ? match[1] : release;
        }

        if (!semver.valid(targetVersion)) {
            rl.close();
            throw new Error(`Invalid target version: ${targetVersion}`);
        }

        // Confirm release
        const tagOk = await confirm(rl, `Releasing v${targetVersion}. Confirm?`);

        if (!tagOk) {
            console.log(chalk.yellow('Release canceled.'));
            rl.close();
            return;
        }

        // Update the package version
        step('\nUpdating the package version...');
        updatePackage(targetVersion);

        // Generate the changelog
        step('\nGenerating the changelog...');
        await run('pnpm', ['run', 'changelog'], true);

        const changelogOk = await confirm(rl, 'Changelog generated. Does it look good?');

        if (!changelogOk) {
            console.log(chalk.yellow('Release canceled after changelog review.'));
            rl.close();
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
    } finally {
        rl.close();
    }
};

function updatePackage(version: string): void {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    pkg.version = version;

    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n');
    console.log(`Updated package.json version to ${version}`);
}

// Direct invocation with typed arguments
releaseScript({
    tsConfigPath: 'tsconfig.json',
    packagePath: 'package.json',
    manager: 'pnpm',
    debug: true,
});

