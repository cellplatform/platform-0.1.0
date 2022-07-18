import { init } from './ServiceWorker.init';

/**
 * TODO 🐷 move to [sys.runtime.web]
 */

/**
 * Helpers for working with the ServiceWorker.
 */
export const WebServiceWorker = {
  /**
   * Ensure the service worker is installed and started.
   */
  init,

  /**
   * Unregister and reload the "service-worker" thread.
   */
  async forceReload(options: { removeQueryKey?: string } = {}) {
    const reload = () => {
      if (options.removeQueryKey) {
        const url = new URL(window.location.href);
        url.searchParams.delete(options.removeQueryKey);
        window.history.pushState({}, '', url.href);
      }
      window.location.reload();
    };

    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) await reg.unregister();
    reload();
  },
};
