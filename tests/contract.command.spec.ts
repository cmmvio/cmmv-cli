import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import inquirer from 'inquirer';
import { createContract } from '../lib/commands/contract.command';
import * as actions from '../lib/actions/index.js';

// Mock dependencies
vi.mock('inquirer', () => ({
    default: {
        prompt: vi.fn(),
    },
}));

vi.mock('../lib/actions/index.js', () => ({
    configureContract: vi.fn().mockResolvedValue(undefined),
}));

describe('Contract Command', () => {
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
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            })
            .mockResolvedValueOnce({ // Add field prompt
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute
        await createContract({});

        // Verify welcome message
        expect(consoleLogSpy).toHaveBeenCalledWith('✨ Welcome to the CMMV ✨');
    });

    it('should create a contract with default options', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            })
            .mockResolvedValueOnce({ // Add field prompt
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute
        await createContract({});

        // Verify
        expect(actions.configureContract).toHaveBeenCalledWith({
            contractOptions: {
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            },
            cacheOptions: {},
            fields: [
                {
                    name: 'id',
                    protoType: 'string',
                    protoRepeated: false,
                    unique: true,
                    nullable: false,
                    addValidations: false,
                },
            ],
        });

        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Contract "TestController" created successfully')
        );
    });

    it('should create a contract with cache options', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: true,
            })
            .mockResolvedValueOnce({ // Cache options
                key: 'testcontroller:',
                ttl: 300,
                compress: true,
            })
            .mockResolvedValueOnce({ // Add field prompt
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute
        await createContract({});

        // Verify
        expect(actions.configureContract).toHaveBeenCalledWith({
            contractOptions: {
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: true,
            },
            cacheOptions: {
                key: 'testcontroller:',
                ttl: 300,
                compress: true,
            },
            fields: [
                {
                    name: 'id',
                    protoType: 'string',
                    protoRepeated: false,
                    unique: true,
                    nullable: false,
                    addValidations: false,
                },
            ],
        });
    });

    it('should create a contract with multiple fields', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            })
            .mockResolvedValueOnce({ // First field
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: true,
            })
            .mockResolvedValueOnce({ // Second field
                name: 'name',
                protoType: 'string',
                protoRepeated: false,
                unique: false,
                nullable: true,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute
        await createContract({});

        // Verify
        expect(actions.configureContract).toHaveBeenCalledWith({
            contractOptions: {
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            },
            cacheOptions: {},
            fields: [
                {
                    name: 'id',
                    protoType: 'string',
                    protoRepeated: false,
                    unique: true,
                    nullable: false,
                    addValidations: false,
                },
                {
                    name: 'name',
                    protoType: 'string',
                    protoRepeated: false,
                    unique: false,
                    nullable: true,
                    addValidations: false,
                },
            ],
        });
    });

    it('should create a contract with field validations', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            })
            .mockResolvedValueOnce({ // Field prompt
                name: 'email',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: true,
            })
            .mockResolvedValueOnce({ // First validation
                type: 'isEmail',
                message: 'Must be a valid email address',
            })
            .mockResolvedValueOnce({ // Add another validation prompt
                addMore: true,
            })
            .mockResolvedValueOnce({ // Second validation
                type: 'minLength',
                message: 'Email must be at least 5 characters',
            })
            .mockResolvedValueOnce({ // Add another validation prompt
                addMore: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute
        await createContract({});

        // Verify
        expect(actions.configureContract).toHaveBeenCalledWith({
            contractOptions: {
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            },
            cacheOptions: {},
            fields: [
                {
                    name: 'email',
                    protoType: 'string',
                    protoRepeated: false,
                    unique: true,
                    nullable: false,
                    addValidations: true,
                    validations: [
                        {
                            type: 'isEmail',
                            message: 'Must be a valid email address',
                        },
                        {
                            type: 'minLength',
                            message: 'Email must be at least 5 characters',
                        },
                    ],
                },
            ],
        });
    });

    it('should use provided args as defaults', async () => {
        // Setup inquirer responses with default values
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'UserController',
                protoPath: 'src/protos/usercontroller.proto',
                protoPackage: 'usercontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: true,
            })
            .mockResolvedValueOnce({ // Cache options
                key: 'user:',
                ttl: 600,
                compress: false,
            })
            .mockResolvedValueOnce({ // Add field prompt
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Execute with args
        await createContract({
            controllerName: 'UserController',
            protoPath: 'src/protos/usercontroller.proto',
            protoPackage: 'usercontroller',
            generateController: true,
            generateEntities: true,
            imports: ['crypto'],
            enableCache: true,
            cacheKey: 'user:',
            cacheTTL: 600,
            cacheCompress: false,
        });

        // Verify that the first prompt was called with the right defaults
        expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                name: 'controllerName',
                default: 'UserController',
            }),
            expect.objectContaining({
                name: 'protoPath',
                default: 'src/protos/usercontroller.proto',
            }),
            expect.objectContaining({
                name: 'protoPackage',
                default: 'usercontroller',
            }),
        ]));
    });

    it('should handle errors during contract creation', async () => {
        // Setup inquirer responses
        vi.mocked(inquirer.prompt)
            .mockResolvedValueOnce({ // Contract options
                controllerName: 'TestController',
                protoPath: 'src/protos/testcontroller.proto',
                protoPackage: 'testcontroller',
                generateController: true,
                generateEntities: true,
                imports: ['crypto'],
                enableCache: false,
            })
            .mockResolvedValueOnce({ // Add field prompt
                name: 'id',
                protoType: 'string',
                protoRepeated: false,
                unique: true,
                nullable: false,
                addValidations: false,
            })
            .mockResolvedValueOnce({ // Add another field prompt
                addAnotherField: false,
            });

        // Setup error
        const testError = new Error('Configuration failed');
        vi.mocked(actions.configureContract).mockRejectedValueOnce(testError);

        // Execute
        await createContract({});

        // Verify
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error creating contract: Configuration failed');
        expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('Visit https://cmmv.io/docs for troubleshooting')
        );
    });
});
