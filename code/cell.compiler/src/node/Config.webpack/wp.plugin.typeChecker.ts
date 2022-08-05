import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import { fs } from '../common';
import * as t from './types';

/**
 * Plugin: ForkTsCheckerWebpackPlugin
 *         https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
 */
export function init(args: t.PluginArgs) {
  const { model } = args;
  const lintFileExists = fs.pathExistsSync(fs.resolve('./.eslintrc.js'));
  const lintEnabled = lintFileExists && model.lint !== false;

  return new ForkTsCheckerWebpackPlugin({
    /**
     * https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
     */
    // eslint: lintEnabled ? { files: 'src/**/*.ts{,x}' } : undefined,

    /**
     * https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#typescript-options
     */
    typescript: { mode: 'write-references' },

    /**
     * https://babeljs.io/docs/en/babel-code-frame#options
     */
    formatter: {
      type: 'codeframe',
      options: {
        linesAbove: 1,
        linesBelow: 0,
      },
    },
  });
}
