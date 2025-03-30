import * as path from 'node:path';
import { Logger } from '@cmmv/core';

import { run } from '../utils/exec.util.js';

export const execLint = async (args) => {
    const logger = new Logger('CLI');
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);

    try {
        await run('node_modules/.bin/eslint', [args.pattern, '--fix', '--debug'], {
            env: {
                TS_NODE_PROJECT: tsConfigPath,
                ...process.env,
            },
            stdio: 'inherit',
        }, true);
    } catch (error) {
        logger.error(`Error executing script:`, error);
    }
};