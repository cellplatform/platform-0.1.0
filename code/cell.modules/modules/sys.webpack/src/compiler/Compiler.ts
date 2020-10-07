import { t, Builder } from '../common';
import { toWebpackConfig } from './toWebpackConfig';
import { webpack } from 'webpack';

export const Compiler = {
  /**
   * Bundles
   */
  // bundle(input: t.ConfigBuilderChain) {
  bundle(input: t.WebpackModel | t.ConfigBuilderChain) {
    // Builder.
    const model = (typeof (input as any).toObject === 'function'
      ? (input as any).toObject()
      : input) as t.WebpackModel;
    const config = toWebpackConfig(model);

    console.log('-------------------------------------------');
    console.log('config', config);

    return new Promise((resolve, reject) => {
      const runner = webpack(config);

      runner.run((err, stats) => {
        resolve();
      });
    });
  },
};
