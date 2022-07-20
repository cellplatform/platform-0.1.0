import { log } from '../common';

type StartResponse = {
  started: boolean;
  path: string;
  error?: string;
};

/**
 * Ensure the service worker is installed and started.
 */
export function init(path: string) {
  return new Promise<StartResponse>(async (resolve, reject) => {
    const done = (started: boolean, error?: string) => {
      if (error) log.warn(error);
      resolve({ started, path, error });
    };

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
      log.warn('Service worker registration failed:', error);
      reject(error);
    }
  });
}
