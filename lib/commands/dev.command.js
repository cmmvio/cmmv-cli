import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { Logger } from '@cmmv/core';

import { run } from '../utils/exec.util.js';

let childProcess = null;
let watcher = null;

export const execDevMode = async (args) => {
  const logger = new Logger('CLI');
  const absolutePath = path.resolve(process.cwd(), args.pathMain);
  const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
  const packagePath = path.resolve(process.cwd(), args.packagePath);

  if (!fs.existsSync(packagePath)) {
    logger.error('package.json not found!');
    return;
  }

  const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  const config = {
    watch: packageJSON?.dev?.watch || ['.'],
    ignore: packageJSON?.dev?.ignore || [],
    persistent: packageJSON?.dev?.persistent || true,
    ignoreInitial: packageJSON?.dev?.ignoreInitial || true,
    cwd: packageJSON?.dev?.cwd || process.cwd(),
    beforeStart: packageJSON?.dev?.beforeStart || null,
  };

  if (!fs.existsSync(tsConfigPath)) {
    logger.error('tsconfig.json not found!');
    return;
  }

  if (childProcess) {
    logger.verbose('Restarting process...');
    childProcess.kill();
  }

  if (args.debug) {
    logger.verbose(`Running script: ${absolutePath}`);
    logger.verbose(`Using tsconfig: ${tsConfigPath}`);
  }

  try {
    if(config.beforeStart && typeof config.beforeStart === "string") {
        const command = config.beforeStart.split(" ");

        await run(
            command[0],
            command.slice(1, command.length -1),
            {
                env: {
                    TS_NODE_PROJECT: tsConfigPath,
                    NODE_ENV: 'dev',
                    ...process.env,
                },
                stdio: 'inherit',
            }
        );
    }

    if (args.watch) {
      if(watcher)
        await watcher.close();

      watcher = chokidar
        .watch(config.watch, {
          ignored: ['.generated', 'node_modules', ...config.ignore],
          persistent: config.persistent,
          ignoreInitial: config.ignoreInitial,
          cwd: config.cwd,
        })
        .on('change', (path) => {
          logger.warning(`Changed: ${path}`);
          execDevMode(args);
        })
        .on('unlink', (path) => {
          logger.error(`Removed: ${path}`);
          execDevMode(args);
        });
    }

    if (args.debug){
        logger.verbose(
            `Start process: node -r @swc-node/register ${absolutePath} --debug=${args.debug}`,
        );
    }

    childProcess = await run(
      'node',
      ['-r', '@swc-node/register', absolutePath],
      {
        env: {
          TS_NODE_PROJECT: tsConfigPath,
          NODE_ENV: 'dev',
          ...process.env,
        },
        stdio: 'inherit',
      },
    );
  } catch (error) {
    logger.error(`Error executing script:`, error);
  }
};
