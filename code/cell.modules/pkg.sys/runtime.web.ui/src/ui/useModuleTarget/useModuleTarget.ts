import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { t, WebRuntime, WebRuntimeBus, rx } from '../common';

type Id = string;
type TargetName = string;
type Address = t.ModuleManifestRemoteImport;

/**
 * Hook that handles loading remote modules via the [EventBus] for a specific "target".
 */
export function useModuleTarget<M = any>(args: {
  instance: { bus: t.EventBus<any>; id?: Id };
  target: TargetName;
}) {
  const { instance, target } = args;
  const busid = rx.bus.instance(instance.bus);

  const [address, setAddress] = useState<Address | undefined>();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [module, setModule] = useState<M | undefined>();
  const ok = !failed;

  useEffect(() => {
    const isTarget = Boolean(target);
    const events = WebRuntimeBus.Events({ instance });
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
  }, [target, instance.id, busid]); // eslint-disable-line

  return {
    ok,
    loading: ok ? loading : false,
    target,
    address,
    module,
  };
}
