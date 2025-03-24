import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';
import { execa } from 'execa';

export const configureProject = async ({
    manager,
    projectName,
    sandbox,
    rpc,
    cache,
    repository,
    queue,
    additionalModules = [],
}) => {
    const cwdPath = path.resolve(process.cwd());
    const projectPath = path.resolve(process.cwd(), projectName);
    const configPath = path.join(projectPath, '.cmmv.config.cjs');

    await execa(
        'git',
        ['clone', 'https://github.com/cmmvio/typescript-starter', projectName],
        { cwd: cwdPath },
    );

    await fs.rmSync(path.join(projectPath, '.git'), {
        recursive: true,
        force: true,
    });

    let otherSettings = '';

    let mainImports = `import { Application } from '@cmmv/core';\n
import { DefaultAdapter, DefaultHTTPModule } from '@cmmv/http';\n`;
    const mainModules = ['DefaultHTTPModule'];
    const mainProviders = [];
    const modules = ['@cmmv/core', '@cmmv/testing', '@cmmv/http'];
    const devModules = ['@cmmv/cli'];

    if (sandbox) {
        modules.push('@cmmv/sandbox');
        console.log('✔ Added Sandbox module.');
        mainImports += "import { SandoxModule } from '@cmmv/sandbox';\n";
        mainModules.push('SandoxModule');
    }

    if (additionalModules.includes('auth')) {
        modules.push('@cmmv/auth');
        console.log('✔ Added Auth module.');
        mainImports += "import { AuthModule } from '@cmmv/auth';\n";
        mainModules.push('AuthModule');
    }

    if (additionalModules.includes('email')) {
        modules.push('@cmmv/email');
        console.log('✔ Added Email module.');
        mainImports += "import { EmailModule } from '@cmmv/email';\n";
        mainModules.push('EmailModule');
    }

    if (additionalModules.includes('elastic')) {
        modules.push('@cmmv/elastic');
        console.log('✔ Added Elastic module.');
        mainImports += "import { ElasticModule } from '@cmmv/elastic';\n";
        mainModules.push('ElasticModule');
    }

    if (additionalModules.includes('encryptor')) {
        modules.push('@cmmv/encryptor');
        console.log('✔ Added Encryptor module.');
        mainImports += "import { EncryptorModule } from '@cmmv/encryptor';\n";
        mainModules.push('EncryptorModule');
    }

    if (additionalModules.includes('events')) {
        modules.push('@cmmv/events');
        console.log('✔ Added Events module.');
        mainImports += "import { EventsModule } from '@cmmv/events';\n";
        mainModules.push('EventsModule');
    }

    if (additionalModules.includes('inspector')) {
        modules.push('@cmmv/inspector');
        console.log('✔ Added Inspector module.');
        mainImports += "import { InspectorModule } from '@cmmv/inspector';\n";
        mainModules.push('InspectorModule');
    }

    if (additionalModules.includes('normalizer')) {
        modules.push('@cmmv/normalizer');
        console.log('✔ Added Normalizer module.');
        mainImports += "import { NormalizerModule } from '@cmmv/normalizer';\n";
        mainModules.push('NormalizerModule');
    }

    if (additionalModules.includes('keyv')) {
        modules.push('@cmmv/keyv');
        console.log('✔ Added Keyv module.');
        mainImports += "import { KeyvModule } from '@cmmv/keyv';\n";
        mainModules.push('KeyvModule');
    }

    if (additionalModules.includes('scheduling')) {
        modules.push('@cmmv/scheduling');
        console.log('✔ Added Scheduling module.');
        mainImports += "import { SchedulingModule, SchedulingService } from '@cmmv/scheduling';\n";
        mainModules.push('SchedulingModule');
        mainProviders.push('SchedulingService');
    }

    if (additionalModules.includes('vault')) {
        modules.push('@cmmv/vault');
        console.log('✔ Added Vault module.');
        mainImports += "import { VaultModule } from '@cmmv/vault';\n";
        mainModules.push('VaultModule');
    }

    if (additionalModules.includes('graphql')) {
        modules.push('@cmmv/graphql');
        console.log('✔ Added GraphQL module.');
        mainImports += "import { GraphQLModule } from '@cmmv/graphql';\n";
        mainModules.push('GraphQLModule');
    }

    if (additionalModules.includes('openapi')) {
        modules.push('@cmmv/openapi');
        console.log('✔ Added OpenAPI module.');
        mainImports += "import { OpenAPIModule } from '@cmmv/openapi';\n";
        mainModules.push('OpenAPIModule');
    }

    if (rpc) {
        modules.push('@cmmv/ws', '@cmmv/protobuf');
        console.log('✔ Added RPC module.');
        mainImports += "import { WSModule, WSAdapter } from '@cmmv/ws';\n";
        mainImports += "import { ProtobufModule } from '@cmmv/protobuf';\n";
        mainModules.push('WSModule', 'ProtobufModule');
        otherSettings += `\n    rpc: {
        enabled: true,
        preLoadContracts: true,
    },`;
    }

    //Cache
    const cacheConfigs = {
        redis: {
            module: '@cmmv/cache @tirke/node-cache-manager-ioredis',
            settings: `\n\n    cache: {
        store: '@tirke/node-cache-manager-ioredis',
        getter: 'ioRedisStore',
        host: 'localhost',
        port: 6379,
        ttl: 600,
    },`,
        },
        memcached: {
            module: '@cmmv/cache cache-manager-memcached-store',
            settings: `\n\n    cache: {
        store: 'cache-manager-memcached-store',
        getter: 'memcachedCach',
        host: '127.0.0.1',
        port: 11211
    },`,
        },
        mongodb: {
            module: '@cmmv/cache cache-manager-mongodb',
            settings: `\n\n    cache: {
        store: 'cache-manager-mongodb',
        getter: 'mongoStore',
        uri: 'mongodb://localhost:27017/cmmv',
        options: {
            collection : "cacheManager",
            compression : false,
            poolSize : 5,
            autoReconnect: true
        }
    },`,
        },
        filesystem: {
            module: '@cmmv/cache cache-manager-fs-binary',
            settings: `\n\n    cache: {
        store: 'cache-manager-fs-binary',
        getter: 'fsStore',
        options: {
            reviveBuffers: true,
            binaryAsStream: true,
            ttl: 3600,
            maxsize: 1000000,
            path: 'diskcache',
            preventfill: true
        }
    },`,
        },
    };

    if (cache !== 'none') {
        mainImports += "import { CacheModule } from '@cmmv/cache';\n";
        mainModules.push('CacheModule');
        modules.push(...cacheConfigs[cache].module.split(' '));
        otherSettings += cacheConfigs[cache].settings;
    }

    //Repository
    const repositoryConfigs = {
        sqlite: {
            module: '@cmmv/repository sqlite3',
            settings: `\n\n    repository: {
        type: 'sqlite',
        database: './database.sqlite',
        synchronize: true,
        logging: true,
    },`,
        },
        mongodb: {
            module: '@cmmv/repository mongodb',
            settings: `\n\n    repository: {
        type: 'mongodb',
        host: 'localhost',
        port: 27017,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true,
    },`,
        },
        postgresql: {
            module: '@cmmv/repository pg',
            settings: `\n\n    repository: {
        type: 'postgres',
        host: 'localhost',
        username: 'postgres',
        password: 'postgres',
        port: 5432,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true,
    },`,
        },
        mysql: {
            module: '@cmmv/repository mysql2',
            settings: `\n\n    repository: {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true,
    },`,
        },
        mssql: {
            module: '@cmmv/repository mssql',
            settings: `\n\n    repository: {
        type: 'mssql',
        host: 'localhost',
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true,
    },`,
        },
        oracle: {
            module: '@cmmv/repository oracledb',
            settings: `\n\n    repository: {
        type: 'oracle',
        host: 'localhost',
        port: 3306,
        database: '${projectName.toLowerCase()}',
        synchronize: true,
        logging: true,
    },`,
        },
    };

    if (repository !== 'none') {
        mainImports += "import { RepositoryModule, Repository } from '@cmmv/repository';\n";
        mainModules.push('RepositoryModule');
        mainProviders.push('Repository');
        modules.push(...repositoryConfigs[repository].module.split(' '));
        otherSettings += repositoryConfigs[repository].settings;
    }

    //Queue
    const queueConfigs = {
        redis: {
            module: '@cmmv/queue ioredis',
            settings: `\n\n    queue: {
        type: process.env.QUEUE_TYPE || "redis",
        url: process.env.QUEUE_URL || "redis://127.0.0.1:6380/4"
    },`,
        },
        rabbitmq: {
            module: '@cmmv/queue amqp-connection-manager',
            settings: `\n\n    queue: {
        type: process.env.QUEUE_TYPE || "rabbitmq",
        url: process.env.QUEUE_URL || "amqp://localhost:5672/${projectName.toLowerCase()}"
    },`,
        },
        kafka: {
            module: '@cmmv/queue kafkajs',
            settings: `\n\n    queue: {
        type: process.env.QUEUE_TYPE || "kafka",
        url: process.env.QUEUE_URL || "kafka1:9092, kafka2:9092"
    },`,
        },
    };

    if (queue !== 'none') {
        mainImports += "import { QueueModule } from '@cmmv/queue';\n";
        mainModules.push('QueueModule');
        modules.push(...queueConfigs[queue].module.split(' '));
        otherSettings += queueConfigs[queue].settings;
    }

    // Generate CMMV config
    let configContent = `require('dotenv').config();

module.exports = {
    env: process.env.NODE_ENV,

    server: {
        host: "0.0.0.0",
        port: 3000,
        poweredBy: false,
        removePolicyHeaders: false,
        compress: {
            enabled: true
        },
        cors: true,
        helmet: {
            enabled: false,
            options: {
                contentSecurityPolicy: false
            }
        }
    },

    view: {
        extractInlineScript: false,
        minifyHTML: true
    },

    i18n: {
        localeFiles: "./src/locale",
        default: "en"
    },

    auth: {
        localRegister: true,
        localLogin: true,
        jwtSecret: process.env.JWT_SECRET || 'secret',
        jwtSecretRefresh: process.env.JWT_SECRET_REFRESH || 'secret',
        expiresIn: 60 * 60 * 24
    },
${otherSettings}
};`;

    await fs.writeFileSync(configPath, configContent, {
        encoding: 'utf-8',
    });

    console.log('✔ Created .cmmv.config.cjs.');

    const mainFile = path.join(projectPath, 'src', 'main.ts');
    const mainContent = `${mainImports}

Application.create({
    httpAdapter: DefaultAdapter,
    modules: [
        ${mainModules.join(',\n\t')}
    ],
    providers: [
        ${mainProviders.join(',\n\t')}
    ]
});
`;

    await fs.writeFileSync(mainFile, mainContent, {
        encoding: 'utf-8',
    });

    console.log('✔ Created src/main.ts.');

    const spinner = ora('Installing dependencies...').start();

    try {
        await execa(manager, ['add', '-D', ...devModules], { cwd: projectPath });
        await execa(manager, ['add', ...modules], { cwd: projectPath });

        spinner.succeed('Installed dependencies.');

        if(manager === 'pnpm'){
            console.log(`\n⚠️  Manually run the following command to approve builds:`);
            console.log(`\n👉  cd ${projectPath} && pnpm approve-builds`);
        }
    } catch (error) {
        spinner.fail('❌ Failed to install dependencies.');
        throw error;
    }
};
