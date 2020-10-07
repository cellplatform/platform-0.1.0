import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create().mode('dev');
  await Webpack.watch(config);
})();
