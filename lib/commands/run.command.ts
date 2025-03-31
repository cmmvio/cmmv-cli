import * as fs from 'node:fs';
import * as path from 'node:path';

import { run } from '../utils/exec.util.js';

export const execRun = async (args) => {
    const absoluteFilename = path.resolve(process.cwd(), args.filename);
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
        await run('node', ['-r', '@swc-node/register', absoluteFilename], {
            env: {
                TS_NODE_PROJECT: tsConfigPath,
                NODE_ENV: 'dev',
                ...process.env,
            },
            stdio: 'inherit',
        }, true);
    } catch (error) {
        console.error(`Error executing script:`, error);
    }
};