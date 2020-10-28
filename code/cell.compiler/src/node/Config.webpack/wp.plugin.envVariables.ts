import { DefinePlugin } from 'webpack';
import { IArgs, Model } from './common';

/**
 * Plugin:
 */
export function init(args: IArgs) {
  const env = Model(args.model).env;
  return new DefinePlugin({ __CELL_ENV__: JSON.stringify(env) });
}
