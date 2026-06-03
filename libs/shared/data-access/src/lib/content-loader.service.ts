import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {Observable} from 'rxjs';

/** Fetches a source study document as raw HTML text (from the app assets). */
@Injectable({providedIn: 'root'})
export class ContentLoaderService {
    private readonly http = inject(HttpClient);

    load(path: string): Observable<string> {
        return this.http.get(path, {responseType: 'text'});
    }
}
