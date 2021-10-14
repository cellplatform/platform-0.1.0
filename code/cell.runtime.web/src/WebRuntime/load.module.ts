import { Encoding } from '../common';

/**
 * Load dynamic container.
 * NOTE: The "remoteEntry.js" script must be loaded before calling this method.
 *
 *    Webpack Docs:
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 *
 */
export async function loadRemoteModule(args: { namespace: string; entry: string }) {
  // Initializes the shared scope.
  // This fills it with known provided modules from this build and all remotes.
  await __webpack_init_sharing__('default');
  const scope = Encoding.escapeNamespace(args.namespace);
  const container = self[scope]; // or get the container somewhere else

  // Initialize the container, it may provide shared modules.
  await container.init(__webpack_share_scopes__.default);
  const factory = await self[scope].get(args.entry);
  const Module = factory();

  return Module;
}
