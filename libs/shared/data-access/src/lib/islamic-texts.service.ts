import {Injectable, inject} from '@angular/core';
import {Observable, map} from 'rxjs';

import {ContentLoaderService} from './content-loader.service';
import {IslamicTexts} from './islamic-texts.model';

const DATA_PATH = 'assets/data/islamic-texts.json';

/** Loads the Letter 53 dataset (sections, passages, vocab). Isomorphic via the
 *  shared content loader, so the reference pages prerender with real data. */
@Injectable({providedIn: 'root'})
export class IslamicTextsService {
    private readonly loader = inject(ContentLoaderService);

    load(): Observable<IslamicTexts> {
        return this.loader.load(DATA_PATH).pipe(map((raw) => JSON.parse(raw) as IslamicTexts));
    }
}
