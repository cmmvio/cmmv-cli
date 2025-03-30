import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@cmmv/core';

import { run } from '../utils/exec.util.js';

export const execRun = async (args) => {
    const logger = new Logger('CLI');
    const absoluteFilename = path.resolve(process.cwd(), args.filename);
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
        logger.error(`Error executing script:`, error);
    }
};