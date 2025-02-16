import fs from 'node:fs';
import path from 'node:path';
import chokidar from 'chokidar';
import { Logger } from "@cmmv/core";

import { run } from "../utils/exec.util.js";

export const execBuild = async (args) => {
    const logger = new Logger("CLI");
    const basePath = path.resolve(process.cwd(), args.basePath);
    const outPath = path.resolve(process.cwd(), args.outPath);
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

    const buildArgs = process.argv.slice(3);

    await fs.rmSync(outPath, { recursive: true, force: true });

    switch(args.mode){
        case "tsc":
            await run("tsc", [
                '--project',
                tsConfigPath,
                ...buildArgs.slice(1)
            ], {
                env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                stdio: 'inherit'
            });
        break;
        case "swc": 
            const tmpDir = `.pm${new Date().getTime()}`;

            await run("swc", [
                basePath,
                "--out-dir", tmpDir, 
                "--ignore", "**/*.spec.ts", 
                ...buildArgs
            ], {
                env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                stdio: 'inherit'
            });

            await fs.renameSync(tmpDir + "/src", outPath);
            await fs.rmSync(tmpDir, { recursive: true, force: true });
        break;
    }
}