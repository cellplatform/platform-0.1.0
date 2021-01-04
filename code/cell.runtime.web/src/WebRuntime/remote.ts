import { useEffect, useState } from 'react';

import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { Encoding, log, t } from '../common';

/**
 * Tools for dynamically loading remote ("federated") module.
 *
 *    Webpack Docs:
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 *
 *  Examples:
 *    Dynamic Remotes
 *    https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes
 *
 *    Dynamic System Host
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 *
 */
export function remote(args: {
  url: string; // Remote manifest URL (eg ".../remoteEntry.js")
  namespace: string;
  entry: string;
  dispose$?: Observable<any>;
  silent?: boolean;
}): t.RuntimeRemoteWeb {
  const { url, namespace, entry, silent } = args;

  const loadModule: t.RuntimeRemoteWeb['module'] = async () => {
    // Initializes the share scope.
    // This fills it with known provided modules from this build and all remotes.
    await __webpack_init_sharing__('default');
    const scope = Encoding.escapeNamespace(namespace);
    const container = self[scope]; // or get the container somewhere else

    // Initialize the container, it may provide shared modules.
    await container.init(__webpack_share_scopes__.default);
    const factory = await self[scope].get(entry);
    const Module = factory();
    return Module;
  };

  const loadScript: t.RuntimeRemoteWeb['script'] = () => {
    const stop$ = new Subject<void>();
    const _event$ = new Subject<t.IRuntimeWebScriptEvent>();
    const event$ = _event$.pipe(takeUntil(stop$));

    if (args.dispose$) {
      args.dispose$.subscribe(() => stop$.next());
    }

    event$
      .pipe(
        filter(() => !silent),
        filter((e) => e.type === 'Runtime/web/script'),
        map((e) => e.payload as t.IRuntimeWebScript),
      )
      .subscribe((e) => {
        if (e.ready) {
          log.info(`Loaded remote: ${e.namespace} | ${e.url}`);
        }
        if (e.failed) {
          log.error(`Failed to load remote: ${e.namespace} | ${e.url}`);
        }
      });

    const next = (args: { ready: boolean; failed: boolean }) => {
      const { ready, failed } = args;
      const payload = { url, namespace, ready, failed };
      _event$.next({ type: 'Runtime/web/script', payload });
    };

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;
    script.setAttribute('data-namespace', namespace);

    script.onload = () => next({ ready: true, failed: false });
    script.onerror = () => next({ ready: false, failed: true });

    next({ ready: false, failed: false });
    document.head.appendChild(script);

    const loader = {
      event$,
      dispose$: stop$.asObservable(),
      dispose: () => {
        document.head.removeChild(script);
        stop$.next();
        stop$.complete();
      },
    };

    return loader;
  };

  const useScript = (url: string) => {
    const [ready, setReady] = useState(false);
    const [failed, setFailed] = useState(false);
    const reset = () => {
      setReady(false);
      setFailed(false);
    };
    useEffect(() => {
      reset();
      const script = loadScript();
      script.event$.subscribe((e) => {
        setReady(e.payload.ready);
        setFailed(e.payload.failed);
      });
      return () => {
        reset();
        script.dispose();
      };
    }, [url]);
    return { ready, failed };
  };

  return {
    url,
    namespace,
    entry,
    module: loadModule,
    script: loadScript,
    useScript: () => useScript(url),
  };
}
