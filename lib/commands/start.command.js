import fs from 'node:fs';
import path from 'node:path';
import { Logger } from '@cmmv/core';

import { run } from '../utils/exec.util.js';

export const execStart = async (args) => {
    const logger = new Logger('CLI');
    const absoluteMainPath = path.resolve(process.cwd(), args.mainPath);
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

    if (args.debug) {
        logger.verbose(`Running script: ${absoluteMainPath}`);
        logger.verbose(`Using tsconfig: ${tsConfigPath}`);
    }

    try {
        if (args.debug) logger.verbose(`Start process: node ${absoluteMainPath}`);

        await run('node', [absoluteMainPath], {
            env: {
                TS_NODE_PROJECT: tsConfigPath,
                NODE_ENV: 'prod',
                ...process.env,
            },
            stdio: 'inherit',
        });
    } catch (error) {
        logger.error(`Error executing script:`, error);
    }
};
