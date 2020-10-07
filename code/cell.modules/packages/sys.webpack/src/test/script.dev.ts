import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create();
  await Webpack.dev(config);
})();
