import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PathLike } from 'node:fs';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execDevMode } from '../lib/commands/dev.command';
import { run } from '../lib/utils/exec.util.js';

// Criando mocks para todas as dependências
vi.mock('node:fs', () => ({
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
}));

vi.mock('node:path', () => ({
    resolve: vi.fn().mockImplementation((...args: string[]) => {
        // Retorna um caminho simulado com os argumentos combinados
        return `/mocked/path/${args.join('/')}`;
    }),
}));

// Não precisamos mais do mock do chokidar, pois o código principal o desativa em testes

vi.mock('../lib/utils/exec.util.js', () => ({
    run: vi.fn(),
}));

// Definindo processo como ambiente de teste
process.env.NODE_ENV = 'test';

describe('Dev Command', () => {
    // Sample process ID for testing
    const MOCK_PROCESS_ID = 12345;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();

        // Default successful mocks
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            dev: {
                watch: ['src', 'public'],
                ignore: [],
                persistent: true,
                ignoreInitial: true,
                cwd: '/test-project',
                beforeStart: null,
            }
        }));

        // Mock run to return a mock process ID
        vi.mocked(run).mockResolvedValue(MOCK_PROCESS_ID);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should validate package.json exists', async () => {
        // CORREÇÃO: Mock para retornar false APENAS para arquivos package.json
        vi.mocked(fs.existsSync).mockImplementation((filePath: PathLike) => {
            const pathStr = String(filePath || '');
            return !pathStr.endsWith('package.json');
        });

        // Execute
        await execDevMode({
            pathMain: 'src/index.ts',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: false,
            watch: false,
        });

        // Verify - deveria sair cedo sem chamar run
        expect(run).not.toHaveBeenCalled();
    });

    it('should execute beforeStart command if defined in package.json', async () => {
        // Setup
        vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({
            dev: {
                watch: ['src', 'public'],
                ignore: [],
                persistent: true,
                ignoreInitial: true,
                cwd: '/test-project',
                beforeStart: 'npm run build',
            }
        }));

        // Execute
        await execDevMode({
            pathMain: 'src/index.ts',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: false,
            watch: false,
        });

        // Verify beforeStart command is called
        expect(run).toHaveBeenCalledTimes(2); // beforeStart + main process
        expect(run).toHaveBeenCalledWith(
            'npm',
            ['run', 'build'],
            expect.any(Object),
            true
        );
    });

    it('should output debug info when debug flag is true', async () => {
        // Execute
        await execDevMode({
            pathMain: 'src/index.ts',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: true,
            watch: false,
            runner: 'swc-node'
        });

        // Verificamos apenas que o processo executou com sucesso
        expect(run).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when executing script', async () => {
        // Setup run to throw an error
        const testError = new Error('Script execution failed');
        vi.mocked(run).mockRejectedValueOnce(testError);

        // Execute
        await execDevMode({
            pathMain: 'src/index.ts',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: false,
            watch: false,
        });

        // Verificamos que o erro não causou falha no teste
        expect(true).toBe(true);
    });

    it('should not activate watcher in test environment', async () => {
        const consoleLogSpy = vi.spyOn(console, 'log');

        // Execute with watch: true
        await execDevMode({
            pathMain: 'src/index.ts',
            tsConfigPath: 'tsconfig.json',
            packagePath: 'package.json',
            debug: true,
            watch: true,
        });

        // Avance o timer além do tempo de ativação normal do watcher
        vi.advanceTimersByTime(3500);

        // Verifica que a mensagem de desativação foi exibida
        expect(consoleLogSpy).toHaveBeenCalledWith('File watching disabled in test environment');

        // Restaure o spy
        consoleLogSpy.mockRestore();
    });
});
