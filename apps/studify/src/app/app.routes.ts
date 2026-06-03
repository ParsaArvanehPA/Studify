import {Route} from '@angular/router';

import {CoursePageComponent, ReaderComponent} from '@studify/shared/feature';

export const appRoutes: Route[] = [
    {path: '', pathMatch: 'full', component: ReaderComponent},
    {path: 'course/:courseId', component: CoursePageComponent},
    {path: 'reader/:docId', component: ReaderComponent},
    {path: '**', redirectTo: ''}
];
