import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { t, WebRuntime, WebRuntimeBus } from '../common';

type TargetName = string;
type InstanceId = string;
type Address = t.ModuleManifestRemoteImport;

/**
 * Hook that handles loading remote modules via the [EventBus] for a specific "target".
 */
export function useModuleTarget<M = any>(args: {
  bus: t.EventBus<any>;
  target: TargetName;
  id?: InstanceId;
}) {
  const { id, bus, target } = args;

  const [address, setAddress] = useState<Address | undefined>();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [module, setModule] = useState<M | undefined>();

  useEffect(() => {
    const isTarget = Boolean(target);
    const events = WebRuntimeBus.Events({ bus, id });
    const use$ = events.useModule.$.pipe(
      filter((e) => isTarget),
      filter((e) => e.target === target),
    );

    const load = (address: Address) => {
      setLoading(true);
      setAddress(address);

      const { url, namespace, entry } = address;
      const remote = WebRuntime.remote({ url, namespace, entry });
      const script = remote.script();

      script.$.subscribe(async (e) => {
        const { ready, failed } = e.payload;
        setModule(ready ? await remote.module() : undefined);
        setFailed(failed);
        setLoading(false);
      });
    };

    const unload = () => {
      setFailed(false);
      setModule(undefined);
      setAddress(undefined);
    };

    use$.subscribe((e) => {
      const address = e.module === null ? undefined : e.module;
      if (address) load(address);
      if (!address) unload();
    });

    return () => events.dispose();
  }, [target, id]); // eslint-disable-line

  return {
    ok: !failed,
    loading,
    target,
    address,
    module,
  };
}
