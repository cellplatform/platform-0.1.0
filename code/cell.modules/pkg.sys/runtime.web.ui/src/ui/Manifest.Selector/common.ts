import { t, value, ModuleUrl } from '../../common';

export * from '../../common';
export * from './constants';

/**
 * TODO 🐷
 * Move more of this into the base [ModuleUrl] canonical URL helper.
 */

export const Parse = {
  manifestUrl(input: string) {
    input = (input || '').trim().replace(/^\:*/, '').replace(/^\.*/, '');

    if (value.isNumeric(input)) input = `localhost:${input}`;

    if (!input.startsWith('http')) {
      input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
    }

    const url = new URL(input);
    let path = url.pathname;
    if (!path.endsWith('.json')) path = `${path.replace(/\/*$/, '')}/index.json`;
    return new URL(`${url.origin}${path}${url.search}`);
  },

  remoteEntryUrl(manifestUrl: string, manifest?: t.ModuleManifest) {
    try {
      if (!manifestUrl || !manifest || !manifest.module.remote) return '';
      if (!ModuleUrl.stripHttp(manifestUrl)) return manifestUrl; // NB: "http:" prefix only.
      if (['http', 'https'].includes(manifestUrl)) return manifestUrl;

      const url = new URL(manifestUrl);

      let path = url.pathname;
      if (path.endsWith('.json')) {
        const parts = path.split('/');
        parts[parts.length - 1] = manifest.module.remote?.entry;
        path = parts.join('/');
      }

      return `${url.origin}${path}${url.search}`;
    } catch (error) {
      return manifestUrl;
    }
  },
};
