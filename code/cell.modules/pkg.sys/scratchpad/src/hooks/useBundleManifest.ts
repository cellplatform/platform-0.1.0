import { useEffect, useState } from 'react';
import { bundle, http, t } from '../common';

/**
 * Loads the bundle manifest.
 */
export function useBundleManifest(args: { path?: string } = {}) {
  const [manifest, setManifest] = useState<t.BundleManifest>();

  useEffect(() => {
    const path = args.path ? args.path : bundle.dev ? '/static/index.json' : '/index.json';
    const url = bundle.path(path);
    http.get(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to load bundle manifest at "${url}"`);
      setManifest(res.json as t.BundleManifest);
    });
  }, [args.path]);

  const files = manifest?.files || [];

  return { manifest, files };
}
