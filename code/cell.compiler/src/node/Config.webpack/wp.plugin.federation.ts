import { DEFAULT, encoding, ModuleFederationPlugin } from '../common';
import * as t from './types';

/**
 * Plugin: Module Federation
 *         https://webpack.js.org/concepts/module-federation/
 */
export function init(args: t.IArgs) {
  const { model } = args;
  const unescape = (obj?: Record<string, unknown>) =>
    encoding.transformKeys(obj || {}, encoding.unescapePath);

  const name = encoding.escapeNamespace(model.namespace || '');
  if (!name) {
    throw new Error(`Module federation requires a "scope" (namespace) value.`);
  }

  return new ModuleFederationPlugin({
    name,
    filename: DEFAULT.FILE.JS.REMOTE_ENTRY,
    remotes: unescape(model.remotes),
    exposes: unescape(model.exposes),
    shared: unescape(model.shared),
  });
}
