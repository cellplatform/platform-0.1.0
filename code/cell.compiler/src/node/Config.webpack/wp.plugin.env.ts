import { DefinePlugin } from 'webpack';

import { constants, Model } from '../common';
import * as t from './types';

/**
 * Plugin: Add environment variables to compiled javascript.
 *         https://webpack.js.org/plugins/define-plugin
 */
export function init(args: t.IArgs) {
  const model = Model(args.model);
  const PKG = constants.PKG;
  const json: t.RuntimeModule = {
    ...model.env,
    module: { name: PKG.name || '', version: PKG.version || '' },
  };
  if (args.isDev && !json.origin) {
    json.origin = { host: `localhost:${model.port()}`, uri: 'cell:dev:A1' };
  }
  return new DefinePlugin({
    __CELL__: JSON.stringify(json),
  });
}
