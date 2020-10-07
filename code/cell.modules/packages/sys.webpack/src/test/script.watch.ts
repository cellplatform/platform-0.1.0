import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create().mode('dev');

  // config.

  await Webpack.watch(config);
})();
