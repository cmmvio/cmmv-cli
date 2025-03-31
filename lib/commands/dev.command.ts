import * as fs from 'node:fs';
import * as path from 'node:path';
import chokidar from 'chokidar';

import { run } from '../utils/exec.util.js';

let childProcess: any = null;
let watcher: any = null;
let restartTimeout: any = null;

const RESTART_DELAY = 1000;

const isTestEnvironment = () => {
    return process.env.NODE_ENV === 'test' ||
           process.env.VITEST !== undefined ||
           process.env.JEST_WORKER_ID !== undefined;
};

export const execDevMode = async (args) => {
    const absolutePath = path.resolve(process.cwd(), args.pathMain);
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
    const packagePath = path.resolve(process.cwd(), args.packagePath);
    const runner = args.runner || 'swc-node';

    if (!fs.existsSync(packagePath)) {
        console.error('package.json not found!');
        return;
    }

    const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    const config = {
        watch: packageJSON?.dev?.watch || ['src', "public"],
        ignore: packageJSON?.dev?.ignore || [],
        persistent: packageJSON?.dev?.persistent || true,
        ignoreInitial: packageJSON?.dev?.ignoreInitial || true,
        cwd: packageJSON?.dev?.cwd || process.cwd(),
        beforeStart: packageJSON?.dev?.beforeStart || null,
    };

    if (!fs.existsSync(tsConfigPath)) {
        console.error('tsconfig.json not found!');
        return;
    }

    if (args.debug) {
        console.log(`Running script: ${absolutePath}`);
        console.log(`Using tsconfig: ${tsConfigPath}`);
        console.log(`Using runner: ${runner}`);
    }

    try {
        if (config.beforeStart && typeof config.beforeStart === 'string') {
            const command = config.beforeStart.split(' ');

            await run(command[0], command.slice(1, command.length), {
                env: {
                    TS_NODE_PROJECT: tsConfigPath,
                    NODE_ENV: 'dev',
                    ...process.env,
                },
                stdio: 'inherit',
            }, true);
        }

        let nodeCommand = 'node';
        let nodeArgs: string[] = [];

        switch (runner) {
            case 'swc-node':
                nodeArgs = ['-r', '@swc-node/register', absolutePath];
                if (args.debug) {
                    console.log(
                        `Start process: node -r @swc-node/register ${absolutePath} --debug=${args.debug}`,
                    );
                }
                break;

            case 'ts-node':
                nodeCommand = 'ts-node';
                nodeArgs = [
                    '--project', tsConfigPath,
                    absolutePath
                ];
                if (args.debug) {
                    console.log(
                        `Start process: ts-node --project ${tsConfigPath} ${absolutePath} --debug=${args.debug}`,
                    );
                }
                break;

            case 'tsx':
                nodeCommand = 'tsx';
                nodeArgs = [absolutePath];
                if (args.debug) {
                    console.log(
                        `Start process: tsx ${absolutePath} --debug=${args.debug}`,
                    );
                }
                break;
        }

        if (args.watch && !isTestEnvironment()) {
            setTimeout(async () => {
                if (watcher) await watcher?.close();

                watcher = chokidar.watch(config.watch, {
                    ignored: [
                        '.generated',
                        'node_modules',
                        'src/entities',
                        'src/models',
                        ...config.ignore,
                    ],
                    persistent: config.persistent,
                    ignoreInitial: config.ignoreInitial,
                    cwd: config.cwd,
                });

                const restartProcess = async () => {
                    if (childProcess) {
                        console.log('Restarting process...');
                        process.kill(childProcess);
                        childProcess = null;
                    }

                    if (restartTimeout) clearTimeout(restartTimeout);

                    if (watcher)
                        await watcher?.close();

                    restartTimeout = setTimeout(() => {
                        execDevMode(args);
                    }, RESTART_DELAY);
                };

                watcher
                    .on('change', (filePath) => {
                        console.log(`File changed: ${filePath}`);
                        restartProcess();
                    })
                    .on('unlink', (filePath) => {
                        console.error(`File removed: ${filePath}`);
                        restartProcess();
                    });
            }, 3000);
        } else if (args.watch && isTestEnvironment()) {
            console.log('File watching disabled in test environment');
        }

        childProcess = await run(
            nodeCommand,
            nodeArgs,
            {
                env: {
                    TS_NODE_PROJECT: tsConfigPath,
                    NODE_ENV: 'dev',
                    ...process.env,
                },
                stdio: 'inherit',
            }
        );
    } catch (error) {
        console.error(`Error executing script:`, error);
    }
};