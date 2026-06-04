import {Route} from '@angular/router';

import {
    CoursePageComponent,
    HomeComponent,
    Letter53Component,
    ReaderComponent,
    VocabularyComponent
} from '@studify/shared/feature';

export const appRoutes: Route[] = [
    {path: '', pathMatch: 'full', component: HomeComponent},
    {path: 'course/:courseId', component: CoursePageComponent},
    {path: 'reader/:docId', component: ReaderComponent},
    {path: 'letter-53', component: Letter53Component},
    {path: 'vocabulary', component: VocabularyComponent},
    {path: '**', redirectTo: ''}
];
