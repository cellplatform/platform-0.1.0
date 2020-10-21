import * as React from 'react';

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

  const Component = React.lazy(loadComponent(system.scope, system.module));

  return (
    <React.Suspense fallback={'Loading System'}>
      <Component />
    </React.Suspense>
  );
}

/**
 * Helpers
 */

/**
 *  Webpack Docs:
 *  https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 *
 *  Examples:
 *    Dynamic Remotes
 *    https://github.com/module-federation/module-federation-examples/tree/master/advanced-api/dynamic-remotes
 *
 *    Dynamic System Host
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
function loadComponent(scope: string, module: string) {
  return async () => {
    // Initializes the share scope.
    // This fills it with known provided modules from this build and all remotes.
    // @ts-ignore
    await __webpack_init_sharing__('default');
    const container = window[scope]; // or get the container somewhere else

    // Initialize the container, it may provide shared modules.
    // @ts-ignore
    await container.init(__webpack_share_scopes__.default);
    const factory = await window[scope].get(module);
    const Module = factory();
    return Module;
  };
}

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
