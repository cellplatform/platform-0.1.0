import { DEFAULT, Encoding, ModuleFederationPlugin } from '../common';
import * as t from './types';

/**
 * Plugin: Module Federation
 *         https://webpack.js.org/concepts/module-federation/
 */
export function init(args: t.PluginArgs) {
  const { model } = args;
  const unescape = (obj?: Record<string, unknown>) =>
    Encoding.transformKeys(obj || {}, Encoding.unescapePath);

  const name = Encoding.escapeNamespace(model.namespace || '');
  if (!name) {
    throw new Error(`Federation requires a "namespace" (scope) value.`);
  }

  return new ModuleFederationPlugin({
    name,
    filename: DEFAULT.FILE.ENTRY.REMOTE,
    remotes: unescape(model.remotes),
    exposes: unescape(model.exposes),
    shared: unescape(model.shared),
  });
}
