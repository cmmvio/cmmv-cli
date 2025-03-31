import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PathLike } from 'node:fs';
import { execStart } from '../lib/commands/start.command';
import { run } from '../lib/utils/exec.util.js';

// Mock dependencies
vi.mock('node:fs', () => ({
    existsSync: vi.fn(),
}));

vi.mock('node:path', () => ({
    resolve: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

vi.mock('../lib/utils/exec.util.js', () => ({
    run: vi.fn().mockResolvedValue(undefined),
}));

describe('Start Command', () => {
    // Spies
    let consoleLogSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Spy on console methods
        consoleLogSpy = vi.spyOn(console, 'log');
        consoleErrorSpy = vi.spyOn(console, 'error');

        // Default mocks
        vi.mocked(fs.existsSync).mockReturnValue(true);
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should validate package.json exists', async () => {
        // Setup
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            return !String(filePath).includes('package.json');
        });

        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
        });

        // Verify
        expect(consoleErrorSpy).toHaveBeenCalledWith('package.json not found!');
        expect(run).not.toHaveBeenCalled();
    });

    it('should validate tsconfig.json exists', async () => {
        // Setup
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            const path = String(filePath);
            // Return true for package.json, false for tsconfig.json
            if (path.includes('tsconfig.json')) return false;
            return true;
        });

        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
        });

        // Verify
        expect(consoleErrorSpy).toHaveBeenCalledWith('tsconfig.json not found!');
        expect(run).not.toHaveBeenCalled();
    });

    it('should output debug information when debug flag is true', async () => {
        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: true,
        });

        // Verify debug logs were output
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Running script:'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Using tsconfig:'));
    });

    it('should not output debug information when debug flag is false', async () => {
        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: false,
        });

        // Verify no debug logs were output
        expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should resolve paths correctly', async () => {
        // Setup
        vi.mocked(path.resolve)
            .mockImplementation((base, filePath) => {
                if (filePath === 'dist/main.js') return '/absolute/path/dist/main.js';
                if (filePath === 'tsconfig.json') return '/absolute/path/tsconfig.json';
                if (filePath === 'package.json') return '/absolute/path/package.json';
                return `${base}/${filePath}`;
            });

        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
        });

        // Verify
        expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'dist/main.js');
        expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'tsconfig.json');
        expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'package.json');

        expect(run).toHaveBeenCalledWith(
            'node',
            ['/absolute/path/dist/main.js'],
            expect.objectContaining({
                env: expect.objectContaining({
                    TS_NODE_PROJECT: '/absolute/path/tsconfig.json',
                }),
            }),
            true
        );
    });

    it('should handle errors during script execution', async () => {
        // Setup
        const testError = new Error('Script execution failed');
        vi.mocked(run).mockRejectedValueOnce(testError);

        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
        });

        // Verify
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error executing script:', testError);
    });

    it('should pass through process environment variables', async () => {
        // Setup
        const originalEnv = process.env;
        process.env = { ...originalEnv, TEST_VAR: 'test-value' };

        // Execute
        await execStart({
            mainPath: 'dist/main.js',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
        });

        // Verify
        expect(run).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            expect.objectContaining({
                env: expect.objectContaining({
                    TEST_VAR: 'test-value',
                }),
            }),
            true
        );

        // Restore original env
        process.env = originalEnv;
    });
});
