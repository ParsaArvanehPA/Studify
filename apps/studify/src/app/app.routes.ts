import {Route} from '@angular/router';

import {CoursePageComponent, HomeComponent, ReaderComponent} from '@studify/shared/feature';

export const appRoutes: Route[] = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: 'course/:courseId', component: CoursePageComponent},
    {path: 'reader/:docId', component: ReaderComponent},
    {path: '**', redirectTo: ''}
];
