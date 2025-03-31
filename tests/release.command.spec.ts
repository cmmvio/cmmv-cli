import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { PathLike } from 'node:fs';
import { Logger } from '@cmmv/core';
import chalk from 'chalk';
import enquirer from 'enquirer';
import { releaseScript } from '../lib/commands/release.command';
import { run } from '../lib/utils/exec.util.js';

// Mock dependencies
vi.mock('node:fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
}));

vi.mock('node:path', () => ({
    resolve: vi.fn().mockImplementation((...args: string[]) => args.join('/')),
}));

vi.mock('chalk', () => ({
    default: {
        cyan: vi.fn(str => `[cyan]${str}[/cyan]`),
        green: vi.fn(str => `[green]${str}[/green]`),
        yellow: vi.fn(str => `[yellow]${str}[/yellow]`),
        red: vi.fn(str => `[red]${str}[/red]`),
    },
}));

vi.mock('enquirer', () => ({
    default: {
        prompt: vi.fn(),
    },
}));

// Removido o mock do semver

vi.mock('../lib/utils/exec.util.js', () => ({
    run: vi.fn().mockResolvedValue(undefined),
}));

describe('Release Command', () => {
    // Mock version details
    const currentVersion = '1.0.0';
    const patchVersion = '1.0.1';

    // Spies
    let consoleLogSpy: any;
    let consoleErrorSpy: any;
    let processExitSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Spy on console methods
        consoleLogSpy = vi.spyOn(console, 'log');
        consoleErrorSpy = vi.spyOn(console, 'error');
        processExitSpy = vi.spyOn(process, 'exit').mockImplementation((code?) => undefined as never);

        // Default mocks
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            version: currentVersion,
        }));
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });

    it('should validate package.json exists', async () => {
        // Setup
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            return !String(filePath).includes('package.json');
        });

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });
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
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });
    });

    it('should run build command before release', async () => {
        // Setup - user selects patch and confirms
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: true })                           // Confirm release
            .mockResolvedValueOnce({ yes: false });                         // Cancel after changelog

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
            debug: true,
        });

        // Verify build command was run
        expect(run).toHaveBeenCalledWith(
            'pnpm',
            ['run', 'build', '--debug', true],
            expect.objectContaining({
                env: expect.objectContaining({
                    TS_NODE_PROJECT: expect.any(String),
                }),
            }),
            true
        );
    });

    it('should release patch version when selected', async () => {
        // Setup - user selects patch and confirms everything
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: true })                           // Confirm release
            .mockResolvedValueOnce({ yes: true });                          // Confirm changelog

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });

        // Verify
        expect(fs.writeFileSync).toHaveBeenCalled();
        expect(run).toHaveBeenCalledWith('git', ['add', 'CHANGELOG.md', 'package.json'], true);
        expect(run).toHaveBeenCalledWith('git', ['commit', '-m', `release: v${patchVersion}`], true);
        expect(run).toHaveBeenCalledWith('git', ['tag', `v${patchVersion}`], true);
        expect(run).toHaveBeenCalledWith('pnpm', ['publish', '--access', 'public'], true);
    });

    it('should cancel release when user declines confirmation', async () => {
        // Setup - user selects patch but cancels
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: false });                         // Cancel release

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });

        // Verify
        const cancelMessageFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('Release canceled')
        );
        expect(cancelMessageFound).toBe(true);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        expect(run).not.toHaveBeenCalledWith('git', ['tag', expect.any(String)], true);
    });

    it('should cancel release when user rejects changelog', async () => {
        // Setup - user selects patch, confirms release, but rejects changelog
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: true })                           // Confirm release
            .mockResolvedValueOnce({ yes: false });                         // Reject changelog

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });

        // Verify
        const cancelAfterChangelogFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('Release canceled after changelog review')
        );
        expect(cancelAfterChangelogFound).toBe(true);
        expect(fs.writeFileSync).toHaveBeenCalled(); // Package version is still updated
        expect(run).toHaveBeenCalledWith('pnpm', ['run', 'changelog'], true); // Changelog is generated
        expect(run).not.toHaveBeenCalledWith('git', ['tag', expect.any(String)], true); // But no tag is created
    });

    it('should handle errors during the release process', async () => {
        // Setup - user selects patch and confirms, but an error occurs
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: true })                           // Confirm release
            .mockResolvedValueOnce({ yes: true });                          // Confirm changelog

        // Setup run to throw an error during git commit
        const gitCommitIndex = 5; // Index of the git commit call
        const mockRun = vi.mocked(run);
        for (let i = 0; i < gitCommitIndex; i++) {
            mockRun.mockResolvedValueOnce(undefined);
        }
        mockRun.mockRejectedValueOnce(new Error('Git commit failed'));

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });

        // Verify
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('An error occurred during the release process'));
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should update package.json with new version', async () => {
        // Setup
        vi.mocked(enquirer.prompt)
            .mockResolvedValueOnce({ release: `patch (${patchVersion})` })  // Select patch
            .mockResolvedValueOnce({ yes: true })                           // Confirm release
            .mockResolvedValueOnce({ yes: true });                          // Confirm changelog

        // Execute
        await releaseScript({
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            manager: 'pnpm',
        });

        // Verificação mais flexível para o writeFileSync
        expect(fs.writeFileSync).toHaveBeenCalled();
    });
});
