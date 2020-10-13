import { log } from '../common';
import { configuration, Webpack } from './config';

(async () => {
  const config = configuration().mode('prod');

  log.info();
  log.info.gray('bundling');
  log.info(config.toObject());
  log.info();
  log.info.gray('━'.repeat(60));
  log.info();

  const res = await Webpack.bundle(config);

  log.info();
  res.stats.log();
})();
