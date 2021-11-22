import { useRef, useEffect } from 'react';

import { slug, t, ManifestUrl, WebRuntimeBus } from '../common';
import { useModuleTarget } from '../useModuleTarget';
import { useManifest } from '../useManifest';

type InstanceId = string;
type Path = string;

/**
 * Hook that handles loadeing remote modules via the [EventBus].
 */
export function useModule<M = any>(args: {
  bus: t.EventBus<any>;
  url?: t.ManifestUrl;
  id?: InstanceId;
}) {
  const { bus, id, url } = args;
  const targetRef = useRef(`module:target:${slug()}`);

  const remote = useModuleTarget<M>({ bus, id, target: targetRef.current });
  const manifest = useManifest({ url });

  /**
   * [Lifecycle]
   */
  useEffect(() => {
    const events = WebRuntimeBus.Events({ bus });
    const target = targetRef.current;
    const url = ManifestUrl.parse(args.url || '');

    const fireLoad = (manifest: t.ModuleManifest, entry: Path) => {
      const module = ManifestUrl.toRemoteImport(url, manifest, entry);
      events.useModule.fire({ target, module });
    };

    const fireUnload = () => events.useModule.fire({ target, module: null });

    if (!manifest.isMock && manifest.json && url && url.ok && url.params.entry) {
      fireLoad(manifest.json, url.params.entry);
    } else {
      fireUnload();
    }

    return () => events.dispose();
  }, [id, args.url, manifest.json]); // eslint-disable-line

  /**
   * [API]
   */
  const api = { ...remote };
  return api;
}
