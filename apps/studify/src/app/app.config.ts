import {provideHttpClient, withFetch} from '@angular/common/http';
import {ApplicationConfig, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideRouter, withInMemoryScrolling} from '@angular/router';

import {appRoutes} from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideClientHydration(withEventReplay()),
        provideHttpClient(withFetch()),
        provideRouter(appRoutes, withInMemoryScrolling({scrollPositionRestoration: 'top'}))
    ]
};
