import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';
import { createProject } from '../lib/commands/create.command';
import * as createAction from '../lib/actions/create.action.js';

vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn(),
    },
}));

vi.mock('../lib/actions/create.action.js', () => ({
    configureProject: vi.fn().mockResolvedValue(undefined),
}));

describe('Create Project Command', () => {
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
            projectName: 'test-project',
            sandbox: true,
            rpc: true,
            repository: 'MongoDB',
            cache: 'Redis',
            queue: 'Redis',
            additionalModules: ['auth', 'graphql'],
            vitest: true,
        });

        await createProject({});

        expect(consoleLogSpy).toHaveBeenCalledWith('✨ Welcome to the CMMV ✨');
    });

    it('should create a project with default options', async () => {
        const projectOptions = {
            manager: 'pnpm',
            projectName: 'test-project',
            sandbox: true,
            rpc: true,
            repository: 'MongoDB',
            cache: 'Redis',
            queue: 'Redis',
            additionalModules: ['auth', 'graphql'],
            vitest: true,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject({});

        expect(createAction.configureProject).toHaveBeenCalledWith({
            manager: 'pnpm',
            projectName: 'test-project',
            sandbox: true,
            rpc: true,
            repository: 'mongodb',
            cache: 'redis',
            queue: 'redis',
            additionalModules: ['auth', 'graphql'],
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Project "test-project" created successfully')
        );
    });

    it('should create a project with SQLite and no cache or queue', async () => {
        const projectOptions = {
            manager: 'yarn',
            projectName: 'sqlite-project',
            sandbox: false,
            rpc: false,
            repository: 'Sqlite',
            cache: 'None',
            queue: 'None',
            additionalModules: ['auth', 'email', 'encryptor'],
            vitest: true,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject({});

        expect(createAction.configureProject).toHaveBeenCalledWith({
            manager: 'yarn',
            projectName: 'sqlite-project',
            sandbox: false,
            rpc: false,
            repository: 'sqlite',
            cache: 'none',
            queue: 'none',
            additionalModules: ['auth', 'email', 'encryptor'],
        });
    });

    it('should create a project with PostgreSQL, Memcached and RabbitMQ', async () => {
        const projectOptions = {
            manager: 'npm',
            projectName: 'pg-project',
            sandbox: true,
            rpc: true,
            repository: 'PostgreSQL',
            cache: 'Memcached',
            queue: 'RabbitMQ',
            additionalModules: ['queue', 'scheduling', 'vault'],
            vitest: false,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject({});

        expect(createAction.configureProject).toHaveBeenCalledWith({
            manager: 'npm',
            projectName: 'pg-project',
            sandbox: true,
            rpc: true,
            repository: 'postgresql',
            cache: 'memcached',
            queue: 'rabbitmq',
            additionalModules: ['queue', 'scheduling', 'vault'],
        });
    });

    it('should use provided args as defaults', async () => {
        const args = {
            projectName: 'args-project',
            rpc: true,
            repository: 'MySQL',
            cache: 'Redis',
            queue: 'Kafka',
            vitest: true,
        };

        const projectOptions = {
            manager: 'pnpm',
            projectName: 'args-project',
            sandbox: true,
            rpc: true,
            repository: 'MySQL',
            cache: 'Redis',
            queue: 'Kafka',
            additionalModules: ['auth', 'graphql'],
            vitest: true,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject(args);

        expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                name: 'projectName',
                default: 'args-project',
            }),
            expect.objectContaining({
                name: 'rpc',
                default: true,
            }),
            expect.objectContaining({
                name: 'repository',
                default: 'MySQL',
            }),
            expect.objectContaining({
                name: 'cache',
                default: 'Redis',
            }),
            expect.objectContaining({
                name: 'queue',
                default: 'Kafka',
            }),
            expect.objectContaining({
                name: 'vitest',
                default: true,
            }),
        ]));
    });

    it('should display correct next steps after project creation', async () => {
        const projectOptions = {
            manager: 'pnpm',
            projectName: 'next-steps-project',
            sandbox: true,
            rpc: false,
            repository: 'None',
            cache: 'None',
            queue: 'None',
            additionalModules: [],
            vitest: false,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject({});

        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('To get started:\n   📂 cd next-steps-project\n   ▶️  pnpm dev')
        );
    });

    it('should handle errors during project creation', async () => {
        const projectOptions = {
            manager: 'pnpm',
            projectName: 'error-project',
            sandbox: true,
            rpc: false,
            repository: 'MongoDB',
            cache: 'Redis',
            queue: 'None',
            additionalModules: ['auth'],
            vitest: false,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        const testError = new Error('Project configuration failed');
        vi.mocked(createAction.configureProject).mockRejectedValueOnce(testError);

        await createProject({});

        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error creating project: Project configuration failed');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Visit https://cmmv.io/docs for troubleshooting')
        );
    });

    it('should log the full error when project creation fails', async () => {
        vi.mocked(inquirer.prompt).mockResolvedValueOnce({
            manager: 'pnpm',
            projectName: 'log-error-project',
            sandbox: true,
            rpc: false,
            repository: 'MongoDB',
            cache: 'Redis',
            queue: 'None',
            additionalModules: ['auth'],
            vitest: false,
        });

        const testError = new Error('Project configuration failed');
        vi.mocked(createAction.configureProject).mockRejectedValueOnce(testError);

        await createProject({});

        expect(consoleLogSpy).toHaveBeenCalledWith(testError);
    });

    it('should create a project with all additional modules', async () => {
        const allModules = [
            'auth', 'email', 'elastic', 'encryptor', 'events',
            'inspector', 'normalizer', 'queue', 'scheduling',
            'vault', 'graphql', 'openapi'
        ];

        const projectOptions = {
            manager: 'pnpm',
            projectName: 'full-modules-project',
            sandbox: true,
            rpc: true,
            repository: 'PostgreSQL',
            cache: 'Redis',
            queue: 'Kafka',
            additionalModules: allModules,
            vitest: true,
        };

        vi.mocked(inquirer.prompt).mockResolvedValueOnce(projectOptions);

        await createProject({});

        expect(createAction.configureProject).toHaveBeenCalledWith({
            manager: 'pnpm',
            projectName: 'full-modules-project',
            sandbox: true,
            rpc: true,
            repository: 'postgresql',
            cache: 'redis',
            queue: 'kafka',
            additionalModules: allModules,
        });
    });
});
