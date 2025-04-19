import * as fs from 'node:fs';
import * as path from 'node:path';

import { run } from '../utils/exec.util.js';

export const execBuild = async (args) => {
    const basePath = path.resolve(process.cwd(), args.basePath);
    const outPath = path.resolve(process.cwd(), args.outPath);
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
    const packagePath = path.resolve(process.cwd(), args.packagePath);
    const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const mainSettings = packageJSON.main;
    const moduleSettings = packageJSON.module;
    const isModule =
        mainSettings && moduleSettings && mainSettings !== moduleSettings;

    if (!fs.existsSync(packagePath)) {
        console.error('package.json not found!');
        return;
    }

    if (!fs.existsSync(tsConfigPath)) {
        console.error('tsconfig.json not found!');
        return;
    }

    const buildArgs = process.argv.slice(3);

    await fs.rmSync(outPath, { recursive: true, force: true });

    switch (args.mode) {
        case 'tsc':
            let params = buildArgs.slice(1);

            if (!params || typeof params !== 'object') params = [];

            if (args.debug) console.log(`Compile: tsc --project ${tsConfigPath}`);

            if (isModule) {
                await run('tsc', ['--project', 'tsconfig.cjs.json'], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit',
                }, true);

                await run('tsc', ['--project', 'tsconfig.esm.json'], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit',
                }, true);
            } else {
                await run('tsc', ['--project', tsConfigPath], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit',
                }, true);
            }
            break;
        case 'swc':
            if (isModule) {
                console.error('To build the module it is necessary to use TSC mode');
            } else {
                const tmpDir = `.pm${new Date().getTime()}`;

                if (args.debug){
                    console.log(
                        `Compile: swc ${basePath} --out-dir=${tmpDir} --ignore=**/*.spec.ts ${buildArgs.slice(1).join(' ')}`,
                    );
                }

                await run(
                    'swc',
                    [
                        basePath,
                        '--out-dir',
                        tmpDir,
                        '--ignore',
                        '**/*.spec.ts',
                        ...buildArgs,
                    ],
                    {
                        env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                        stdio: 'inherit',
                    },
                    true,
                );

                await fs.renameSync(tmpDir + '/src', outPath);
                await fs.rmSync(tmpDir, { recursive: true, force: true });
            }
            break;
    }
};