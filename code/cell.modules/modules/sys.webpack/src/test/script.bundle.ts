import { Webpack } from '..';

(async () => {
  const builder = Webpack.config.create().mode('prod');
  const res = await Webpack.bundle(builder);

  /* eslint-disable */
  console.log();
  console.log(res.model);
  console.log('-------------------------------------------');
  console.log(res.toString());
  console.log();
  /* eslint-enable */
})();
