import { Webpack } from '..';

(async () => {
  const builder = Webpack.config.create();
  await Webpack.dev(builder);
})();
