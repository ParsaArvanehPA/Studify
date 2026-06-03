import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

import {readFileSync} from 'node:fs';
import {join} from 'node:path';


import {ContentLoaderService} from '@studify/shared/data-access';

/**
 * Server/prerender content loader. During static prerendering there is no asset
 * server for HttpClient to hit, so we read the study HTML straight from the source
 * assets on disk. The read is synchronous so the content is present in the very
 * first server render pass (otherwise SSR snapshots the loading state). The browser
 * keeps using the async HttpClient-based loader.
 */
@Injectable()
export class ServerContentLoaderService extends ContentLoaderService {
    override load(path: string): Observable<string> {
        const file = join(process.cwd(), 'apps/studify/src', path);
        return of(readFileSync(file, 'utf-8'));
    }
}
