import { useRef, useEffect } from 'react';

import { slug, t, ManifestUrl, WebRuntimeBus, rx } from '../common';
import { useModuleTarget } from '../useModuleTarget';
import { useManifest } from '../useManifest';

type Id = string;
type Path = string;

/**
 * Hook that handles loading remote modules via the [EventBus].
 */
export function useModule<M = any>(args: {
  instance: t.ModuleInstance;
  url?: t.ManifestUrl;
  log?: boolean;
}) {
  const { instance, url } = args;
  const targetRef = useRef(`module:target:${slug()}`);
  const busid = rx.bus.instance(instance.bus);

  const remote = useModuleTarget<M>({ instance, target: targetRef.current, log: args.log });
  const manifest = useManifest({ url });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const events = WebRuntimeBus.Events({ instance });
    const target = targetRef.current;
    const url = ManifestUrl.parse(args.url || '');

    const fireLoad = (manifest: t.ModuleManifest, entry: Path) => {
      const module = ManifestUrl.toRemoteImport(url, manifest, entry);
      events.useModule.fire({ target, module });
    };

    const fireUnload = () => events.useModule.fire({ target, module: null });

    if (!manifest.is.mock && manifest.json && url && url.ok && url.params.entry) {
      fireLoad(manifest.json, url.params.entry);
    } else {
      fireUnload();
    }

    return () => events.dispose();
  }, [instance.id, busid, url, manifest.json]); // eslint-disable-line

  /**
   * [API]
   */
  const api = { ...remote };
  return api;
}
