import {ApplicationConfig, mergeApplicationConfig} from '@angular/core';
import {provideServerRendering, withRoutes} from '@angular/ssr';

import {ContentLoaderService} from '@studify/shared/data-access';

import {appConfig} from './app.config';
import {serverRoutes} from './app.routes.server';
import {ServerContentLoaderService} from './server-content-loader.service';

const serverConfig: ApplicationConfig = {
    providers: [
        provideServerRendering(withRoutes(serverRoutes)),
        {provide: ContentLoaderService, useClass: ServerContentLoaderService}
    ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
