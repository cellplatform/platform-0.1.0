/**
 * TODO 🐷 move to [sys.runtime.web]
 */

/**
 * Helpers for working with the ServiceWorker.
 */
export const ServiceWorker = {
  /**
   * Starts a service worker.
   */
  start(path: string, options: { runOnLocalhost?: boolean } = {}) {
    type T = {
      started: boolean;
      path: string;
      error?: string;
    };

    return new Promise<T>(async (resolve, reject) => {
      const done = (started: boolean, error?: string) => {
        if (error) console.log(error);
        resolve({ started, path, error });
      };

      if (location.hostname === 'localhost' && !options.runOnLocalhost) {
        return done(false, `Not starting service-worker on [localhost]`);
      }

      if (!('serviceWorker' in navigator)) {
        return done(false, `Service workers not supported`);
      }

      try {
        const registration = await navigator.serviceWorker.register(path);

        if (registration.active?.state === 'activated') {
          return done(true); // Success.
        }

        if (!registration.installing) {
          return done(false, `Service worker not activated AND not installing.`);
        }

        registration.installing.addEventListener('statechange', (e: Event) => {
          if (registration.active?.state !== 'activated') return;
          done(true); // Success.
        });
      } catch (error: any) {
        console.error('Service worker registration failed:', error);
        reject(error);
      }
    });
  },

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
