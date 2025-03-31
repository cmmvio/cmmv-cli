import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execa } from 'execa';
import { run } from '../lib/utils/exec.util';

// Mock execa dependency
vi.mock('execa', () => ({
    execa: vi.fn(),
}));

describe('Exec Utility', () => {
    let mockProcess: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a mock subprocess object with a PID
        mockProcess = {
            pid: 12345,
            catch: vi.fn().mockReturnThis(),
        };

        // Default behavior: execa returns the mock process in non-await mode
        vi.mocked(execa).mockReturnValue(mockProcess);
    });

    it('should return process ID when awaitProcess is false', async () => {
        // Execute
        const result = await run('node', ['--version'], {}, false);

        // Verify
        expect(execa).toHaveBeenCalledWith(
            'node',
            ['--version'],
            expect.objectContaining({
                stdio: 'inherit',
                forceKillAfterDelay: false,
            })
        );
        expect(mockProcess.catch).toHaveBeenCalled();
        expect(result).toBe(12345);
    });

    it('should wait for process completion when awaitProcess is true', async () => {
        // Execute
        await run('node', ['--version'], {}, true);

        // Verify
        expect(execa).toHaveBeenCalledWith(
            'node',
            ['--version'],
            expect.objectContaining({
                stdio: 'inherit',
                forceKillAfterDelay: false,
            })
        );

        // In await mode, we don't set up a .catch() handler
        expect(mockProcess.catch).not.toHaveBeenCalled();
    });

    it('should merge options with defaults', async () => {
        // Setup custom options
        const customOpts = {
            env: { NODE_ENV: 'test' },
            cwd: '/custom/directory',
        };

        // Execute
        await run('npm', ['install'], customOpts, false);

        // Verify custom options are merged with defaults
        expect(execa).toHaveBeenCalledWith(
            'npm',
            ['install'],
            expect.objectContaining({
                stdio: 'inherit',
                forceKillAfterDelay: false,
                env: { NODE_ENV: 'test' },
                cwd: '/custom/directory',
            })
        );
    });

    it('should handle canceled processes in non-await mode', async () => {
        // Setup a process that will be canceled
        mockProcess.catch.mockImplementation(callback => {
            // Call the callback with a canceled error
            callback({ isCanceled: true });
            return mockProcess;
        });

        // Execute
        const result = await run('npm', ['test'], {}, false);

        // Verify
        expect(mockProcess.catch).toHaveBeenCalled();
        expect(result).toBe(12345); // Still returns PID even if canceled
    });

    it('should ignore non-canceled errors in non-await mode', async () => {
        // Setup a process that will error but not be canceled
        mockProcess.catch.mockImplementation(callback => {
            // Call the callback with a non-canceled error
            callback({ isCanceled: false, message: 'Command failed' });
            return mockProcess;
        });

        // Execute
        const result = await run('npm', ['test'], {}, false);

        // Verify
        expect(mockProcess.catch).toHaveBeenCalled();
        expect(result).toBe(12345); // Still returns PID even with error
    });

    it('should suppress errors in await mode', async () => {
        // Setup execa to throw an error in await mode
        vi.mocked(execa).mockRejectedValueOnce(new Error('Command failed'));

        // Execute and verify no error is thrown
        await expect(run('npm', ['unknown-command'], {}, true)).resolves.not.toThrow();
    });

    it('should handle undefined options', async () => {
        // Execute with undefined options
        await run('node', ['--version'], undefined, false);

        // Verify default options are used
        expect(execa).toHaveBeenCalledWith(
            'node',
            ['--version'],
            expect.objectContaining({
                stdio: 'inherit',
                forceKillAfterDelay: false,
            })
        );
    });

    it('should use child process stdout when stdio is not specified', async () => {
        // Execute with options that don't include stdio
        await run('node', ['--version'], { cwd: '/some/dir' }, false);

        // Verify stdio is set to inherit
        expect(execa).toHaveBeenCalledWith(
            'node',
            ['--version'],
            expect.objectContaining({
                stdio: 'inherit',
                cwd: '/some/dir',
            })
        );
    });

    it('should override default stdio if specified in options', async () => {
        // Execute with custom stdio option
        await run('node', ['--version'], { stdio: 'pipe' }, false);

        // Verify custom stdio was used
        expect(execa).toHaveBeenCalledWith(
            'node',
            ['--version'],
            expect.objectContaining({
                stdio: 'pipe', // Not 'inherit'
                forceKillAfterDelay: false,
            })
        );
    });
});
