import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create();

  // config.

  await Webpack.watch(config);
})();
