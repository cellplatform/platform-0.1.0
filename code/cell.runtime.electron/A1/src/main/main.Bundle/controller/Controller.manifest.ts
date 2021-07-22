import { http, slug, t } from '../common';

export function ManifestController(args: {
  bus: t.EventBus<t.BundleEvent>;
  events: t.BundleEvents;
}) {
  const { bus, events } = args;

  /**
   * Fetch manifest.
   */
  events.manifest.fetch.req$.subscribe(async (e) => {
    const { tx = slug() } = e;
    const source = (e.source || '').trim();

    const done = (options: { exists?: boolean; manifest?: t.Manifest; error?: string } = {}) => {
      const { manifest, error } = options;
      const exists = options.exists ?? Boolean(manifest);
      bus.fire({
        type: 'runtime.electron/Bundle/fetchManifest:res',
        payload: { tx, exists, source, manifest, error },
      });
    };

    try {
      const res = await http.get(source);
      const { ok, status } = res;
      if (!ok) {
        const message = status === 404 ? 'Manifest not found' : 'Failed while fetching manifest';
        const error = `[${res.status}] ${message}`;
        return done({ error });
      }

      const manifest = res.json as t.Manifest;

      if (!isManifest(manifest)) {
        const error = `The retrieved JSON is not a manifest`;
        return done({ exists: true, error });
      }

      done({ manifest }); // Success.
    } catch (err) {
      // Fail.
      const error = `Failed while fetching manifest. ${err.message}`;
      return done({ error });
    }
  });
}

/**
 * [Helpers]
 */

function isManifest(input: any) {
  if (typeof input !== 'object') return false;
  return Array.isArray(input.files) && typeof input.hash === 'object';
}
