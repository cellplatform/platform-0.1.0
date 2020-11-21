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
  const env: t.RuntimeEnv = {
    ...model.env,
    module: { name: PKG.name || '', version: PKG.version || '' },
  };
  if (args.isDev && !env.origin) {
    env.origin = { host: `localhost:${model.port()}`, cell: 'cell:dev:A1' };
  }

  return new DefinePlugin({ __CELL_ENV__: JSON.stringify(env) });
}
