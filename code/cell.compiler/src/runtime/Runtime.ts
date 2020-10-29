import { GlobalCellEnv } from '../types/global';
import { Uri, Urls } from '@platform/cell.schema';
import { encoding } from '../common/encoding';

export const Runtime = {
  /**
   * Wrapper around the __CELL_ENV__ constants inserted into modules
   * by the [cell.compiler] packager, providing variables and helper
   * methods for using the variables.
   *
   * See compiler plugins:
   *    -  wp.plugin.env => [DefinePlugin]
   */
  bundle(input?: GlobalCellEnv) {
    input = input || __CELL_ENV__;
    const location = typeof window === 'object' ? window.location : undefined;
    const bundle = input?.bundle;
    const isDev = !Boolean(bundle) || (bundle?.cell || '').startsWith('cell:dev:');

    if (isDev) {
      Uri.ALLOW.NS = [...Uri.ALLOW.NS, 'dev'];
    }

    const hostname = bundle?.host || location?.host || 'localhost:3000';
    const cell = bundle?.cell || 'cell:dev:A1';
    const dir = trimSlash(bundle?.dir || '');
    const urls = Urls.create(hostname);
    const port = urls.port;
    const host = `${urls.protocol}://${urls.host}${port === 80 ? '' : `:${port}`}`;

    return {
      isDev,
      host,
      cell,
      dir,
      path(path: string) {
        return isDev
          ? `${host}/${trimSlash(path)}`
          : urls.cell(cell).file.byName(prepend(dir, path)).toString();
      },
    };
  },

  /**
   * Extract module information from __CELL_ENV__.
   */
  module(input?: GlobalCellEnv) {
    input = input || __CELL_ENV__;
    const module: GlobalCellEnv['module'] = input?.module || { name: '', version: '' };
    return module;
  },

  /**
   * Dynamnically load a remote ("federated") module.
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
   */
  remoteLoader(namespace: string, module: string) {
    const scope = encoding.escapeNamespace(namespace);
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
  },
};

/**
 * Helpers
 */

const trimSlash = (path: string) => (path || '').trim().replace(/\/*$/, '').replace(/^\/*/, '');
const prepend = (dir: string, path: string) => {
  path = trimSlash(path);
  return dir ? `${dir}/${path}` : path;
};
