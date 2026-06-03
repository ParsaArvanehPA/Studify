import {Route} from '@angular/router';

import {ReaderComponent} from '@studify/shared/feature';

export const appRoutes: Route[] = [
    {path: '', pathMatch: 'full', component: ReaderComponent},
    {path: 'reader/:docId', component: ReaderComponent},
    {path: '**', redirectTo: ''}
];
