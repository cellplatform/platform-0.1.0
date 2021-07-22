import { Urls, Uri, t } from '../common';

export const ManifestUrl = {
  parse: ParseManifestUrl,
};

/**
 * Parses a URL to a manifest file.
 */
export function ParseManifestUrl(input: string): t.ManifestUrl {
  const { url, error } = parseUrl(input);

  const api = {
    ok: true,
    href: url?.href ?? '',
    domain: url?.host ?? '',
    cell: '',
    path: '',
    dir: '',
    filename: '',
    error,
  };

  // Parse path.
  (() => {
    const error = (detail: string) => (api.error = `Invalid manifest URL '${input}' - ${detail}`);
    let path = (url?.pathname ?? '').replace(/^\//, '');
    if (!path) return error('no path');

    // Cell URI.
    const uri = path.match(/^cell\:[\d\w]+\:[A-Z]+[1-9]+/);
    api.cell = uri ? uri[0] : '';
    if (!api.cell || !Uri.is.cell(api.cell)) return error(`not a cell URI`);

    // Path.
    path = path.substring(api.cell.length);
    if (!path.startsWith('/fs/')) return error('no filesystem path');
    path = path.substring('/fs/'.length);
    if (!path) return error('no filesystem path');
    api.path = path;

    if (!path.endsWith('.json')) return error('not a ".json" file.');

    // Directory/filename.
    const index = path.lastIndexOf('/');
    if (index < 0) api.filename = path;
    if (index >= 0) {
      api.dir = path.substring(0, index);
      api.filename = path.substring(index + 1);
    }

    return;
  })();

  api.ok = !Boolean(api.error);
  return api;
}


/**
 * [Helpers]
 */

function parseUrl(input: string): { url?: URL; error?: string } {
  const error = (detail: string) => ({ error: `Invalid manifest URL '${input}' - ${detail}` });
  try {
    if (typeof input !== 'string') return error('not a string');
    if (!input.trim()) return error('empty');
    return { url: new URL(input) };
  } catch (err) {
    return error('unable to parse');
  }
}
