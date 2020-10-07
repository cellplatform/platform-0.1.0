import { Webpack } from '..';

(async () => {
  const config = Webpack.config.create('home').title('My Title');
  await Webpack.dev(config);
})();
