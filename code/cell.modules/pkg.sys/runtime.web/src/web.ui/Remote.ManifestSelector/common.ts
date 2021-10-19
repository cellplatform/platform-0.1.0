export * from '../../common';
import { t } from '../../common';

export const Parse = {
  manifestUrl(input: string) {
    input = (input || '').trim().replace(/^\:*/, '').replace(/^\.*/, '');
    if (!input.startsWith('http')) {
      input = input.startsWith('localhost') ? `http://${input}` : `https://${input}`;
    }
    const url = new URL(input);
    let path = url.pathname;
    if (!path.endsWith('.json')) path = `${path.replace(/\/*$/, '')}/index.json`;
    return new URL(`${url.origin}${path}${url.search}`);
  },

  remoteEntryUrl(manifestUrl: string, manifest?: t.ModuleManifest) {
    if (!manifestUrl || !manifest || !manifest.module.remote) return '';

    const url = new URL(manifestUrl);
    let path = url.pathname;
    if (path.endsWith('.json')) {
      const parts = path.split('/');
      parts[parts.length - 1] = manifest.module.remote?.entry;
      path = parts.join('/');
    }
    return `${url.origin}${path}${url.search}`;
  },
};
