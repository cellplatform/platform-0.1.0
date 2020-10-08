import { log } from '@platform/log/lib/server';
import { configuration, Webpack } from './webpack';

(async () => {
  const config = configuration().mode('prod');

  log.info();
  log.info.gray('bundling');
  log.info(config.toObject());
  log.info();
  log.info.gray('━'.repeat(60));
  log.info();

  const res = await Webpack.bundle(config);

  res.stats.log();
})();
