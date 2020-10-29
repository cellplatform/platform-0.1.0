import HtmlWebPackPlugin from 'html-webpack-plugin';

import { Model } from '../common';
import * as t from './types';

/**
 * Plugin: HTML
 *         https://webpack.js.org/plugins/html-webpack-plugin
 */
export function init(args: t.IArgs) {
  const model = Model(args.model);
  if (model.isNode) {
    return undefined;
  } else {
    const obj = model.toObject();
    const title = obj.title || obj.namespace || 'Untitled';
    return new HtmlWebPackPlugin({ title });
  }
}
