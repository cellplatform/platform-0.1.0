import { useEffect, useState } from 'react';
import { bundle, http, t } from '../common';

/**
 * Loads the ModuleManifest (aka "bundle").
 */
export function useModuleManifest(args: { path?: string } = {}) {
  const [manifest, setManifest] = useState<t.ModuleManifest>();

  useEffect(() => {
    const path = args.path ? args.path : bundle.dev ? '/static/index.json' : '/index.json';
    const url = bundle.path(path);
    http.get(url).then((res) => {
      if (!res.ok) throw new Error(`Failed to load ModuleManifest at "${url}"`);
      setManifest(res.json as t.ModuleManifest);
    });
  }, [args.path]);

  const files = manifest?.files || [];

  return { manifest, files };
}
