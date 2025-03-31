import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as path from 'node:path';
import { Logger } from '@cmmv/core';
import { execLint } from '../lib/commands/lint.command';
import { run } from '../lib/utils/exec.util.js';

// Mock dependencies
vi.mock('node:path', () => ({
    resolve: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

vi.mock('../lib/utils/exec.util.js', () => ({
    run: vi.fn(),
}));

describe('Lint Command', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should run eslint with the correct arguments', async () => {
        // Setup
        const args = {
            tsConfigPath: 'tsconfig.json',
            pattern: 'src/**/*.ts',
        };

        // Execute
        await execLint(args);

        // Verify
        expect(path.resolve).toHaveBeenCalledWith(expect.any(String), args.tsConfigPath);
        expect(run).toHaveBeenCalledWith(
            'node_modules/.bin/eslint',
            [args.pattern, '--fix', '--debug'],
            expect.objectContaining({
                env: expect.objectContaining({
                    TS_NODE_PROJECT: expect.any(String),
                }),
                stdio: 'inherit',
            }),
            true
        );
    });

    it('should use custom pattern if provided', async () => {
        // Setup with custom pattern
        const args = {
            tsConfigPath: 'tsconfig.json',
            pattern: 'src/components/**/*.tsx',
        };

        // Execute
        await execLint(args);

        // Verify
        expect(run).toHaveBeenCalledWith(
            'node_modules/.bin/eslint',
            [args.pattern, '--fix', '--debug'],
            expect.any(Object),
            true
        );
    });

    it('should handle errors from run command', async () => {
        // Setup
        const args = {
            tsConfigPath: 'tsconfig.json',
            pattern: 'src/**/*.ts',
        };

        const testError = new Error('ESLint failed to execute');
        vi.mocked(run).mockRejectedValueOnce(testError);

        // Execute
        await execLint(args);
    });

    it('should resolve tsConfigPath correctly', async () => {
        // Setup
        const args = {
            tsConfigPath: './custom/path/tsconfig.custom.json',
            pattern: 'src/**/*.ts',
        };

        // Mock specific resolved path
        vi.mocked(path.resolve).mockReturnValueOnce('/absolute/path/to/custom/path/tsconfig.custom.json');

        // Execute
        await execLint(args);

        // Verify
        expect(path.resolve).toHaveBeenCalledWith(expect.any(String), args.tsConfigPath);
        expect(run).toHaveBeenCalledWith(
            'node_modules/.bin/eslint',
            [args.pattern, '--fix', '--debug'],
            expect.objectContaining({
                env: expect.objectContaining({
                    TS_NODE_PROJECT: '/absolute/path/to/custom/path/tsconfig.custom.json',
                }),
            }),
            true
        );
    });

    it('should pass environment variables to eslint', async () => {
        // Setup
        const args = {
            tsConfigPath: 'tsconfig.json',
            pattern: 'src/**/*.ts',
        };

        // Save original process.env
        const originalEnv = process.env;
        // Set a test variable
        process.env = { ...originalEnv, TEST_VAR: 'test-value' };

        // Execute
        await execLint(args);

        // Verify environment variables are passed
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

        // Restore original process.env
        process.env = originalEnv;
    });

    it('should use proper stdio configuration', async () => {
        // Setup
        const args = {
            tsConfigPath: 'tsconfig.json',
            pattern: 'src/**/*.ts',
        };

        // Execute
        await execLint(args);

        // Verify stdio is set to 'inherit'
        expect(run).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            expect.objectContaining({
                stdio: 'inherit',
            }),
            true
        );
    });
});
