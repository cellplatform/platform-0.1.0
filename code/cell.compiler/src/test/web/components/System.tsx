import * as React from 'react';
import { loadComponent } from './loadComponent';
import { WebRuntime } from '../../../runtime.web';

export type ISystem = {
  url: string;
  scope: string;
  module: string;
};

export type ISystemProps = { system?: ISystem };

/**
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
export function System(props: ISystemProps = {}) {
  const { system } = props;
  const url = system?.url;
  const { ready, failed } = useDynamicScript({ url });

  if (!system) {
    return <h2>No system specified</h2>;
  }
  if (!ready) {
    return <h2>Loading dynamic script: {url}</h2>;
  }
  if (failed) {
    return <h2>Failed to load dynamic script: {url}</h2>;
  }

  const loader = WebRuntime.remoteLoader(system.scope, system.module);
  const Component = React.lazy(loader);

  return (
    <React.Suspense fallback={'Loading System'}>
      <Component />
    </React.Suspense>
  );
}

/**
 * Helpers
 */

const useDynamicScript = (args: { url?: string }) => {
  const { url } = args;
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!url) {
      return;
    }

    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    setReady(false);
    setFailed(false);

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      setReady(true);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${url}`);
      setReady(false);
      setFailed(true);
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${url}`);
      document.head.removeChild(element);
    };
  }, [url]);

  return { ready, failed };
};
