import 'reflect-metadata';

import { Application } from '@cmmv/core';
import { DefaultAdapter, DefaultHTTPModule } from '@cmmv/http';
import { ProtobufModule } from '@cmmv/protobuf';
import { WSModule, WSAdapter } from '@cmmv/ws';
import { ViewModule, VueTranspile } from '@cmmv/view';
import { RepositoryModule, Repository } from '@cmmv/repository';
import { CacheModule, CacheService } from '@cmmv/cache';

import { ApplicationModule } from './app.module';

Application.create({
    httpAdapter: DefaultAdapter,
    wsAdapter: WSAdapter,
    modules: [
        DefaultHTTPModule,
        ProtobufModule,
WSModule,
        ViewModule,
        RepositoryModule,
        CacheModule,
        ApplicationModule,
    ],
    services: [Repository, CacheService],
    transpilers: [VueTranspile],
    contracts: [],
});