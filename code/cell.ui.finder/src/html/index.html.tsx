import { Subject } from 'rxjs';
import { MemoryCache } from '@platform/cache';

/**
 * Stub in fake {env} if running in browser
 * NOTE:
 *    This is set within the `preload.js` script within the desktop app
 *    and will not be available if running directly within the browser.
 */
if (!(window as any).env) {
  (window as any).env = {
    host: location.host,
    def: '',
    cache: MemoryCache.create(),
    event$: new Subject<{}>(),
  };
}

if ((window as any).env) {
  import('./init').then((e) => e.render());
}
