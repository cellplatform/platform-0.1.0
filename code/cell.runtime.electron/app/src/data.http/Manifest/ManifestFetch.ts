import { t, Urls } from './common';
import { ManifestUrl } from './ManifestUrl';

type Uri = string;

export const ManifestFetch = {
  /**
   * GET: Fetch the manifest from the network.
   */
  async get<T extends t.Manifest>(args: { host: string | number; cell: Uri; path: string }) {
    const path = toPath(args.path);
    const urls = Urls.create(args.host);
    const url = urls.cell(args.cell).file.byName(path).toString();
    const res = await fetch(url);
    const { ok, status } = res;
    const manifest = ok ? ((await res.json()) as T) : undefined;
    const exists = Boolean(manifest);
    const files = manifest?.files ?? [];
    return { ok, url, path, status, exists, manifest, files };
  },

  /**
   * GET: Derive a fetcher from a url.
   */
  url(input: string) {
    const url = ManifestUrl(input);
    return {
      url,
      async get<T extends t.Manifest>() {
        if (url.error) throw new Error(`Cannot GET manifest. ${url.error}`);
        const { domain: host, cell, path } = url;
        return ManifestFetch.get<T>({ host, cell, path });
      },
    };
  },
};

/**
 * [Helpers]
 */

function toPath(input: string) {
  let path = (input || '').trim();
  if (!path.endsWith('.json')) path = `${path.replace(/\/*$/, '')}/index.json`;
  return path;
}
