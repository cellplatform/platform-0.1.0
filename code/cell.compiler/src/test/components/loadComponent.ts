import { encoding } from '../../common/encoding';

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
export function loadComponent(scope: string, module: string) {
  scope = encoding.escapeNamespace(scope);

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
