import React, { useEffect, useState } from 'react';
import { filter } from 'rxjs/operators';

import { Is, log, ModuleUrl, rx, t, WebRuntime, WebRuntimeBus } from '../common';

type TargetName = string;
type Address = t.ModuleManifestRemoteImport;

/**
 * Hook that handles loading remote modules via the [EventBus] for a specific "target".
 */
export function useModuleTarget<M = any>(args: {
  instance: t.ModuleInstance;
  target: TargetName;
  log?: boolean;
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
      const remote = WebRuntime.Module.remote({ url, namespace, entry });
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
  const renderDefaultEntry = async (bus: t.EventBus<any>): Promise<JSX.Element | null> => {
    const fn = (module as any)?.default as t.ModuleDefaultEntry;

    if (ok && address && typeof fn === 'function') {
      const { namespace, entry } = address;
      const url = ModuleUrl.ensureManifest(address.url).href;
      const pump = rx.pump.create(bus);
      const ctx: t.ModuleDefaultEntryContext = { source: { url, namespace, entry } };

      const res = fn(pump, ctx);
      const isPromise = Is.promise(res);
      const el = isPromise ? await res : res;
      const isElement = React.isValidElement(el);

      if (args.log) {
        log.group('💦 (useModuleTarget).renderDefaultEntry');
        log.info('url (manifest):', url);
        log.info('ctx:', ctx);
        log.info('response:', res);
        log.info('response (is promise):', isPromise);
        log.info('response (is element):', isElement);
        log.info('element:', el);
        log.groupEnd();
      }

      return isElement ? el : null;
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
