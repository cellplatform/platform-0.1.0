import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create('home').mode('dev');
  await Webpack.watch(config);
})();
