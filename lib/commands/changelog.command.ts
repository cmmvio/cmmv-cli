import * as fs from 'node:fs';
import * as path from 'node:path';

import { run } from '../utils/exec.util.js';

export const execChangelog = async (args) => {
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
    const packagePath = path.resolve(process.cwd(), args.packagePath);

    if (!fs.existsSync(packagePath)) {
        console.error('package.json not found!');
        return;
    }

    if (!fs.existsSync(tsConfigPath)) {
        console.error('tsconfig.json not found!');
        return;
    }

    try {
        await run('conventional-changelog', ['-p', 'angular', '-i', 'CHANGELOG.md', '-s'], {
            stdio: 'inherit',
        }, true);
    } catch (error) {
        console.error(`Error executing script:`, error);
    }
};