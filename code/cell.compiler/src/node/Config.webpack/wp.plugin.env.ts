import { DefinePlugin } from 'webpack';

import { constants, Model } from '../common';
import * as t from './types';

/**
 * Plugin: Add environment variables to compiled javascript.
 *         https://webpack.js.org/plugins/define-plugin
 */
export function init(args: t.PluginArgs) {
  const model = Model(args.model);
  const PKG = constants.PKG.load();

  const json: t.RuntimeModule = {
    ...model.env,
    module: { name: PKG.name || '', version: PKG.version || '' },
  };

  return new DefinePlugin({
    __CELL__: JSON.stringify(json),
  });
}
