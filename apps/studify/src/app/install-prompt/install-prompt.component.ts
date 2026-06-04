import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {ChangeDetectionStrategy, Component, PLATFORM_ID, afterNextRender, inject, signal} from '@angular/core';

/** The `beforeinstallprompt` event isn't in the DOM lib typings. */
interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    readonly userChoice: Promise<{outcome: 'accepted' | 'dismissed'}>;
}

const DISMISS_KEY = 'studify:pwaDismissed';

/**
 * Install banner + service-worker registration. On Chromium it captures
 * `beforeinstallprompt` and offers a one-tap install; on iOS Safari (which has
 * no such event) it shows the "Share → Add to Home Screen" hint instead. The
 * banner is hidden when already installed (standalone) or previously dismissed.
 */
@Component({
    selector: 'studify-install-prompt',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './install-prompt.component.html',
    styleUrl: './install-prompt.component.scss'
})
export class InstallPromptComponent {
    private readonly document = inject(DOCUMENT);
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private deferred: BeforeInstallPromptEvent | undefined;

    protected readonly visible = signal(false);
    protected readonly ios = signal(false);

    constructor() {
        afterNextRender(() => {
            this.registerServiceWorker();
            if (this.isStandalone() || this.isDismissed()) {
                return;
            }
            const win = this.document.defaultView;
            if (!win) {
                return;
            }
            win.addEventListener('beforeinstallprompt', (event) => {
                event.preventDefault();
                this.deferred = event as BeforeInstallPromptEvent;
                this.ios.set(false);
                this.visible.set(true);
            });
            win.addEventListener('appinstalled', () => this.finish());
            if (this.isIos()) {
                this.ios.set(true);
                this.visible.set(true);
            }
        });
    }

    protected async install(): Promise<void> {
        const prompt = this.deferred;
        if (!prompt) {
            return;
        }
        await prompt.prompt();
        await prompt.userChoice;
        this.finish();
    }

    protected dismiss(): void {
        this.persistDismissal();
        this.visible.set(false);
    }

    private finish(): void {
        this.deferred = undefined;
        this.visible.set(false);
        this.persistDismissal();
    }

    private registerServiceWorker(): void {
        if (!this.isBrowser || !('serviceWorker' in navigator)) {
            return;
        }
        const url = new URL('sw.js', this.document.baseURI).href;
        navigator.serviceWorker.register(url).catch(() => {
            /* registration is best-effort */
        });
    }

    private isStandalone(): boolean {
        const win = this.document.defaultView;
        const navStandalone = (this.document.defaultView?.navigator as {standalone?: boolean} | undefined)?.standalone;
        return !!win?.matchMedia('(display-mode: standalone)').matches || navStandalone === true;
    }

    private isIos(): boolean {
        const ua = this.document.defaultView?.navigator.userAgent ?? '';
        return /iphone|ipad|ipod/i.test(ua);
    }

    private isDismissed(): boolean {
        try {
            return localStorage.getItem(DISMISS_KEY) === '1';
        } catch {
            return false;
        }
    }

    private persistDismissal(): void {
        try {
            localStorage.setItem(DISMISS_KEY, '1');
        } catch {
            /* storage unavailable */
        }
    }
}
