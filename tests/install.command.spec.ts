import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';
import { installModules } from '../lib/commands/install.command';
import * as installAction from '../lib/actions/install.action.js';

vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn(),
    },
}));

vi.mock('../lib/actions/install.action.js', () => ({
    installModuleAction: vi.fn().mockResolvedValue(undefined),
}));

describe('Install Command', () => {
    let consoleLogSpy: any;
    let consoleErrorSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();
        consoleLogSpy = vi.spyOn(console, 'log');
        consoleErrorSpy = vi.spyOn(console, 'error');
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('should show welcome message', async () => {
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            additionalModules: ['auth', 'cache'],
        });

        await installModules({});

        expect(consoleLogSpy).toHaveBeenCalledWith('✨ Welcome to the CMMV ✨');
    });

    it('should install selected modules with pnpm', async () => {
        const mockResponse = {
            manager: 'pnpm',
            additionalModules: ['auth', 'cache', 'graphql'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(mockResponse);

        await installModules({});

        expect(installAction.installModuleAction).toHaveBeenCalledWith(mockResponse);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🎉 Modules installed successfully!');
    });

    it('should install selected modules with yarn', async () => {
        const mockResponse = {
            manager: 'yarn',
            additionalModules: ['auth', 'email', 'events'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(mockResponse);

        await installModules({});

        expect(installAction.installModuleAction).toHaveBeenCalledWith(mockResponse);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🎉 Modules installed successfully!');
    });

    it('should install selected modules with npm', async () => {
        const mockResponse = {
            manager: 'npm',
            additionalModules: ['repository', 'ws', 'protobuf'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(mockResponse);

        await installModules({});

        expect(installAction.installModuleAction).toHaveBeenCalledWith(mockResponse);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🎉 Modules installed successfully!');
    });

    it('should install all available modules', async () => {
        const allModules = [
            'auth', 'cache', 'email', 'elastic', 'encryptor', 'events',
            'inspector', 'normalizer', 'queue', 'scheduling', 'vault',
            'graphql', 'openapi', 'parallel', 'repository', 'sandbox',
            'testing', 'ws', 'protobuf', 'mcp'
        ];

        const mockResponse = {
            manager: 'pnpm',
            additionalModules: allModules,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(mockResponse);

        await installModules({});

        expect(installAction.installModuleAction).toHaveBeenCalledWith(mockResponse);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🎉 Modules installed successfully!');
    });

    it('should handle empty module selection', async () => {
        const mockResponse = {
            manager: 'pnpm',
            additionalModules: [],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(mockResponse);

        await installModules({});

        expect(installAction.installModuleAction).toHaveBeenCalledWith(mockResponse);
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🎉 Modules installed successfully!');
    });

    it('should handle installation errors', async () => {
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            additionalModules: ['auth', 'cache'],
        });

        const testError = new Error('Failed to install modules');
        vi.mocked(installAction.installModuleAction).mockRejectedValueOnce(testError);

        await installModules({});

        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error installing modules: Failed to install modules');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Visit https://cmmv.io/docs for troubleshooting')
        );
    });

    it('should log the initialization message', async () => {
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            additionalModules: ['auth'],
        });

        await installModules({});

        expect(consoleLogSpy).toHaveBeenCalledWith('\n🚀 Initializing modules...');
    });

    it('should log the full error when installation fails', async () => {
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            additionalModules: ['auth'],
        });

        const testError = new Error('Failed to install modules');
        vi.mocked(installAction.installModuleAction).mockRejectedValueOnce(testError);

        await installModules({});

        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
    });
});
