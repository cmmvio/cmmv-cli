import fs from 'node:fs';
import path from 'node:path';
import { Logger } from "@cmmv/core";

import { run } from "../utils/exec.util.js";

export const execBuild = async (args) => {
    const logger = new Logger("CLI");
    const basePath = path.resolve(process.cwd(), args.basePath);
    const outPath = path.resolve(process.cwd(), args.outPath);
    const tsConfigPath = path.resolve(process.cwd(), args.tsConfigPath);
    const packagePath = path.resolve(process.cwd(), args.packagePath);
    const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const mainSettings = packageJSON.main;
    const moduleSettings = packageJSON.module;
    const isModule = (!mainSettings && !moduleSettings && mainSettings !== moduleSettings);

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
            const params = buildArgs.slice(1);

            if(!params || typeof params !== "object")
                params = [];

            if(args.debug)
                console.log(`Compile: tsc --project ${tsConfigPath}`);

            if(isModule){
                await run("tsc", [
                    '--project',
                    'tsconfig.cjs.json'
                ], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit'
                });

                await run("tsc", [
                    '--project',
                    'tsconfig.esm.json'
                ], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit'
                });
            }
            else{
                await run("tsc", [
                    '--project',
                    tsConfigPath
                ], {
                    env: { ...process.env, TS_NODE_PROJECT: tsConfigPath },
                    stdio: 'inherit'
                });
            }
        break;
        case "swc": 
            if(isModule){
                console.error('To build the module it is necessary to use TSC mode');
            }
            else{
                if(args.debug)
                    console.log(`Compile: swc ${basePath} --out-dir=${tmpDir} --ignore=**/*.spec.ts ${buildArgs.slice(1).join(" ")}`);
            
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
            }
        break;
    }
}