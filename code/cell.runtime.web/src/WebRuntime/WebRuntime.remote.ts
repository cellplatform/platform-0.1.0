import { useEffect, useState } from 'react';

import { Observable, Subject, firstValueFrom } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { log, t } from '../common';
import { loadRemoteModule } from './load.module';
import { Script } from './load.script';
import { useModule } from './useModule';

/**
 * Tools for dynamically loading remote ("federated") module.
 *
 *    Webpack Docs:
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 *
 *  Examples:
 *
 *    Dynamic Remotes
 *    https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes
 *
 *    Dynamic System Host
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 *
 */
export function remote(args: {
  url: string; // Remote entry URL (eg ".../remoteEntry.js")
  namespace: string;
  entry: string;
  dispose$?: Observable<any>;
  silent?: boolean;
}): t.RuntimeRemoteWeb {
  const { url, namespace, entry, silent, dispose$ } = args;

  const api: t.RuntimeRemoteWeb = {
    url,
    namespace,
    entry,

    script() {
      return Script.load({ url, namespace, dispose$, silent });
    },

    async module() {
      if (!Script.exists(url)) await Script.load({ url, namespace, dispose$, silent }).ready;
      return loadRemoteModule({ namespace, entry });
    },

    useModule<M = any>() {
      return useModule<M>(api);
    },
  };

  return api;
}
