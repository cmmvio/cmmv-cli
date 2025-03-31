import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execBuild } from '../lib/commands/build.command';
import { run } from '../lib/utils/exec.util';
import { PathLike } from 'node:fs';

// Mock dependencies
vi.mock('node:fs', () => ({
    rmSync: vi.fn(),
    renameSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
}));

vi.mock('node:path', () => ({
    resolve: vi.fn().mockImplementation((...args: string[]) => {
        if (args.length > 0 && args[0] === process.cwd())
            return `/mnt/f/Node/cmmv-cli/${args.slice(1).join('/')}`;

        return args.join('/');
    }),
    join: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

vi.mock('@cmmv/core', () => ({
    Logger: class MockLogger {
        constructor(public readonly context: string) { }
        log = vi.fn();
        error = vi.fn();
    }
}));

vi.mock('../lib/utils/exec.util.js', () => ({
    run: vi.fn(),
}));

const originalProcessArgv = process.argv;

describe('Build Command', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        process.argv = ['node', 'cli', 'build', '--debug=true'];

        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            main: 'dist/cjs/index.js',
            module: 'dist/esm/index.js'
        }));
    });

    afterEach(() => {
        process.argv = originalProcessArgv;
    });

    it('should validate package.json exists', async () => {
        // Setup
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            const pathStr = filePath.toString();
            if (pathStr.includes('package.json')) {
                return false;
            }
            return true;
        });

        // Execute
        await execBuild({
            basePath: 'src',
            outPath: 'dist',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            mode: 'tsc',
            debug: true
        });

        // Verify
        expect(fs.rmSync).not.toHaveBeenCalled();
        expect(run).not.toHaveBeenCalled();
    });

    it('should validate tsconfig.json exists', async () => {
        // Setup
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            const pathStr = filePath.toString();
            if (pathStr.includes('tsconfig.json')) {
                return false;
            }
            return true;
        });

        // Execute
        await execBuild({
            basePath: 'src',
            outPath: 'dist',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            mode: 'tsc',
            debug: true
        });

        // Verify
        expect(fs.rmSync).not.toHaveBeenCalled();
        expect(run).not.toHaveBeenCalled();
    });

    it('should clean output directory before building', async () => {
        // Execute
        await execBuild({
            basePath: 'src',
            outPath: 'dist',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            mode: 'tsc',
            debug: false
        });

        // Verify
        // FIX: Check for any path ending with 'dist' rather than exactly 'dist'
        expect(fs.rmSync).toHaveBeenCalledWith(
            expect.stringMatching(/dist$/),
            { recursive: true, force: true }
        );
    });

    describe('TSC Mode', () => {
        it('should build a regular package with tsc', async () => {
            // Setup
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                main: 'dist/index.js'
            }));

            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'tsc',
                debug: false
            });

            // Verify
            expect(run).toHaveBeenCalledTimes(1);
            expect(run).toHaveBeenCalledWith(
                'tsc',
                ['--project', expect.stringContaining('tsconfig.json')],
                expect.objectContaining({
                    env: expect.objectContaining({ TS_NODE_PROJECT: expect.any(String) }),
                    stdio: 'inherit'
                }),
                true
            );
        });

        it('should build a dual module package with tsc', async () => {
            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'tsc',
                debug: false
            });

            // Verify
            expect(run).toHaveBeenCalledTimes(2);
            expect(run).toHaveBeenCalledWith(
                'tsc',
                ['--project', expect.stringContaining('tsconfig.cjs.json')],
                expect.any(Object),
                true
            );
            expect(run).toHaveBeenCalledWith(
                'tsc',
                ['--project', expect.stringContaining('tsconfig.esm.json')],
                expect.any(Object),
                true
            );
        });

        it('should output debug info when debug is enabled', async () => {
            // Setup
            const consoleSpy = vi.spyOn(console, 'log');

            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'tsc',
                debug: true
            });

            // Verify
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Compile: tsc --project/));
        });
    });

    describe('SWC Mode', () => {
        it('should error for dual module packages with swc', async () => {
            // Setup
            const consoleSpy = vi.spyOn(console, 'error');

            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'swc',
                debug: false
            });

            // Verify
            expect(consoleSpy).toHaveBeenCalledWith('To build the module it is necessary to use TSC mode');
            expect(run).not.toHaveBeenCalled();
        });

        it('should build a regular package with swc', async () => {
            // Setup
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                main: 'dist/index.js'
            }));

            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'swc',
                debug: false
            });

            // Verify
            expect(run).toHaveBeenCalledTimes(1);
            expect(run).toHaveBeenCalledWith(
                'swc',
                expect.arrayContaining([
                    expect.any(String), // src path
                    '--out-dir',
                    expect.stringMatching(/\.pm\d+/),
                    '--ignore',
                    '**/*.spec.ts'
                ]),
                expect.any(Object),
                true
            );

            // FIX: Use exact string for first param since that's what the error shows
            expect(fs.renameSync).toHaveBeenCalledWith(
                expect.stringMatching(/\.pm\d+\/src$/),
                expect.stringMatching(/dist$/)
            );

            expect(fs.rmSync).toHaveBeenCalledWith(
                expect.stringMatching(/\.pm\d+$/),
                { recursive: true, force: true }
            );
        });

        it('should output debug info when debug is enabled', async () => {
            // Setup
            vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
                main: 'dist/index.js'
            }));
            const consoleSpy = vi.spyOn(console, 'log');

            // Execute
            await execBuild({
                basePath: 'src',
                outPath: 'dist',
                tsConfigPath: 'tsconfig.json',
                packagePath: 'package.json',
                mode: 'swc',
                debug: true
            });

            // Verify
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringMatching(/Compile: swc .+src --out-dir=\.pm\d+ --ignore=/)
            );
        });
    });
});
