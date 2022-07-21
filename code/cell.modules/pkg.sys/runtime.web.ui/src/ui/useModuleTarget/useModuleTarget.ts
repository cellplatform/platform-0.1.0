import React, { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { Is, rx, t, WebRuntime, WebRuntimeBus } from '../common';

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

  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [address, setAddress] = useState<Address | undefined>();
  const [module, setModule] = useState<M | undefined>();

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

  /**
   * Runs a [DefaultModuleEntry] function if one has been loaded.
   */
  const renderDefaultEntry = async (bus: t.EventBus<any>) => {
    const fn = (module as any)?.default as t.ModuleDefaultEntry;

    if (ok && address && typeof fn === 'function') {
      const { namespace, entry } = address;

      const url = address.url;
      const ctx: t.ModuleDefaultEntryContext = { source: { url, namespace, entry } };
      const res = fn(bus, ctx);

      const el = Is.promise(res) ? await res : res;
      if (React.isValidElement(el)) return el;
    }

    return null;
  };

  /**
   * API
   */
  const ok = !failed;
  return {
    ok,
    loading: ok ? loading : false,

    target,
    module,

    address,
    addressKey: address ? `${address.url}:${address.namespace}:${address.entry}` : '',

    renderDefaultEntry,
  };
}
