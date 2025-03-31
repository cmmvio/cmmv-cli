import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';
import { createModule } from '../lib/commands/module.command';
import * as moduleAction from '../lib/actions/module.action.js';

// Mock dependencies
vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn(),
    },
}));

vi.mock('../lib/actions/module.action.js', () => ({
    configureModule: vi.fn().mockResolvedValue(undefined),
}));

describe('Module Command', () => {
    // Spies
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
        // Setup inquirer responses
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            moduleName: 'test-module',
            additionalModules: ['core'],
        });

        // Execute
        await createModule({});

        // Verify welcome message
        expect(consoleLogSpy).toHaveBeenCalledWith('✨ Welcome to the CMMV ✨');
    });

    it('should create a module with default options', async () => {
        // Setup inquirer responses
        const moduleOptions = {
            manager: 'pnpm',
            moduleName: 'test-module',
            additionalModules: ['core'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Module "test-module" created successfully!/)
        );
    });

    it('should use provided moduleName as default', async () => {
        // CORREÇÃO: Precisamos fornecer um valor de retorno para inquirer.prompt
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            moduleName: 'provided-module',
            additionalModules: ['core'],
        });

        // Execute
        await createModule({ moduleName: 'provided-module' });

        // Verify that inquirer was called with the provided moduleName as default
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                name: 'moduleName',
                default: 'provided-module',
            }),
        ]));
    });

    it('should create a module with multiple dependencies', async () => {
        // Setup inquirer responses with multiple dependencies
        const moduleOptions = {
            manager: 'pnpm',
            moduleName: 'multi-dep-module',
            additionalModules: ['core', 'http', 'auth', 'repository'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);
    });

    it('should create a module with npm as package manager', async () => {
        // Setup inquirer responses with npm
        const moduleOptions = {
            manager: 'npm',
            moduleName: 'npm-module',
            additionalModules: ['core'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);

        // CORREÇÃO: Verificar se ALGUMA das chamadas contém o padrão
        const nextStepsCallFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('npm build')
        );
        expect(nextStepsCallFound).toBe(true);
    });

    it('should create a module with yarn as package manager', async () => {
        // Setup inquirer responses with yarn
        const moduleOptions = {
            manager: 'yarn',
            moduleName: 'yarn-module',
            additionalModules: ['core'],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);

        // CORREÇÃO: Verificar se ALGUMA das chamadas contém o padrão
        const nextStepsCallFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('yarn build')
        );
        expect(nextStepsCallFound).toBe(true);
    });

    it('should display correct next steps after module creation', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            moduleName: 'steps-module',
            additionalModules: ['core'],
        });

        // Execute
        await createModule({});

        // CORREÇÃO: Verificar se ALGUMA das chamadas contém os padrões esperados
        const cdPatternFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('cd steps-module')
        );
        expect(cdPatternFound).toBe(true);

        const buildPatternFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('pnpm build')
        );
        expect(buildPatternFound).toBe(true);

        const docsPatternFound = consoleLogSpy.mock.calls.some(
            call => call[0] && call[0].includes('documentation')
        );
        expect(docsPatternFound).toBe(true);
    });

    it('should handle errors during module creation', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            moduleName: 'error-module',
            additionalModules: ['core'],
        });

        // Setup error
        const testError = new Error('Module configuration failed');
        vi.mocked(moduleAction.configureModule).mockRejectedValueOnce(testError);

        // Execute
        await createModule({});

        // Verify error handling
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error creating module: Module configuration failed');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringMatching(/Visit https:\/\/cmmv.io\/docs for troubleshooting/)
        );
    });

    it('should create a module with all possible dependencies', async () => {
        // Setup inquirer responses with all dependencies
        const allModules = ['core', 'http', 'encryptor', 'auth', 'email', 'vault', 'queue', 'repository'];

        const moduleOptions = {
            manager: 'pnpm',
            moduleName: 'full-module',
            additionalModules: allModules,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);
    });

    it('should create a module with no additional dependencies', async () => {
        // Setup inquirer responses with no dependencies
        const moduleOptions = {
            manager: 'pnpm',
            moduleName: 'minimal-module',
            additionalModules: [],
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(moduleOptions);

        // Execute
        await createModule({});

        // Verify
        expect(moduleAction.configureModule).toHaveBeenCalledWith(moduleOptions);
    });

    it('should show initialization message', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            moduleName: 'init-message-module',
            additionalModules: ['core'],
        });

        // Execute
        await createModule({});

        // Verify initialization message
        expect(consoleLogSpy).toHaveBeenCalledWith('\n🚀 Initializing module "init-message-module"...');
    });
});
