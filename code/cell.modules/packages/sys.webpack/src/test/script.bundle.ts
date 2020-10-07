import { Webpack } from '..';
import { log } from '@platform/log/lib/server';

(async () => {
  const config = Webpack.config.create().mode('prod');

  log.info();
  log.info.gray('bundling');
  log.info(config.toObject());
  log.info();
  log.info.gray('━'.repeat(60));
  log.info();

  const res = await Webpack.bundle(config);

  log.info(res.toString());
  log.info();
})();
