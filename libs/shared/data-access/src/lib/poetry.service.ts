import {Injectable, inject} from '@angular/core';
import {Observable, map} from 'rxjs';

import {ContentLoaderService} from './content-loader.service';
import {PoetryDeck} from './poetry.model';

const DATA_PATH = 'assets/data/poetry-translation.json';

/** Loads the Poetry Translation dataset (sessions, poems → couplets). Isomorphic via the
 *  shared content loader, so the cheat sheet prerenders with real data. */
@Injectable({providedIn: 'root'})
export class PoetryService {
    private readonly loader = inject(ContentLoaderService);

    load(): Observable<PoetryDeck> {
        return this.loader.load(DATA_PATH).pipe(map((raw) => JSON.parse(raw) as PoetryDeck));
    }
}
