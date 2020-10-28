import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { fs, IArgs } from './common';

/**
 * Plugin: ForkTsCheckerWebpackPlugin
 *         https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
 */
export function init(args: IArgs) {
  const { model } = args;
  const lintFileExists = fs.pathExistsSync(fs.resolve('./.eslintrc.js'));
  const lintEnabled = lintFileExists && model.lint !== false;

  return new ForkTsCheckerWebpackPlugin({
    /**
     * https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
     */
    eslint: lintEnabled ? { files: 'src/**/*.ts{,x}' } : undefined,

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
        linesAbove: 2,
        linesBelow: 3,
      },
    },
  });
}
