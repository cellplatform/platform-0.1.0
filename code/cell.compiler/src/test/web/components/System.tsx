import * as React from 'react';

import { WebRuntime } from '../../../runtime.web';

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */

export type System = { url: string; namespace: string; module: string };

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
export const System: React.FC<System> = (props: System) => {
  const { url, namespace, module } = props;

  const remote = WebRuntime.remote({ url, namespace, entry: module });
  const { ready, failed } = remote.useScript();

  if (!ready) {
    return <h2>Loading dynamic script: {url}</h2>;
  }
  if (failed) {
    return <h2>Failed to load dynamic script: {url}</h2>;
  }

  const Component = React.lazy(remote.module);

  return (
    <React.Suspense fallback={'Loading System'}>
      <Component />
    </React.Suspense>
  );
};
