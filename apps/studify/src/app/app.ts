import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';

import {InstallPromptComponent} from './install-prompt/install-prompt.component';

@Component({
    selector: 'studify-root',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterOutlet, InstallPromptComponent],
    template: '<router-outlet /><studify-install-prompt />'
})
export class App {}
