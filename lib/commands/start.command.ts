import * as fs from 'node:fs';
import * as path from 'node:path';

import { run } from '../utils/exec.util.js';

export const execStart = async (args) => {
    const absoluteMainPath = path.resolve(process.cwd(), args.mainPath);
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

    if (args.debug) {
        console.log(`Running script: ${absoluteMainPath}`);
        console.log(`Using tsconfig: ${tsConfigPath}`);
    }

    try {
        await run('node', [absoluteMainPath], {
            env: {
                TS_NODE_PROJECT: tsConfigPath,
                NODE_ENV: 'prod',
                ...process.env,
            },
            stdio: 'inherit',
        }, true);
    } catch (error) {
        console.error(`Error executing script:`, error);
    }
};