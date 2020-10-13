import { log } from '@platform/log/lib/server';
import * as compiler from '../../compiler.config';

(async () => {
  const config = compiler.configure().mode('prod');

  log.info();
  log.info.gray('bundling');
  log.info(config.toObject());
  log.info();
  log.info.gray('━'.repeat(60));
  log.info();

  const res = await compiler.Webpack.bundle(config);
  res.stats.log();
})();
