import { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { t, WebRuntime } from '../../common';
import { WebRuntimeBus } from '../../web.RuntimeBus';

type InstanceId = string;
type Address = t.ModuleManifestRemoteImport;

/**
 * Hook that handles loading remote modules via the [EventBus] for a specific "target".
 */
export function useModuleTarget<M = any>(args: {
  bus: t.EventBus<any>;
  target: string;
  id?: InstanceId;
}) {
  const { bus, target } = args;

  const [address, setAddress] = useState<Address | undefined>();
  const [failed, setFailed] = useState(false);
  const [module, setModule] = useState<M | undefined>();

  useEffect(() => {
    const events = WebRuntimeBus.Events({ bus, id: args.id });
    const use$ = events.useModule.$.pipe(filter((e) => e.target === target));

    const load = (address: Address) => {
      setAddress(address);

      const { url, namespace, entry } = address;
      const remote = WebRuntime.remote({ url, namespace, entry });
      const script = remote.script();

      script.$.subscribe(async (e) => {
        const { ready, failed } = e.payload;
        setModule(ready ? await remote.module() : undefined);
        setFailed(failed);
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
  }, [target, args.id]); // eslint-disable-line

  return {
    target,
    remote: { address },
    failed,
    module,
  };
}
