import { log, t } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Output info about the build.
 */
export async function info(argv: t.Argv) {
  const name = util.nameArg(argv);
  const config = await util.loadConfig(argv.config, { name });
  log.info();
  logger.info(config);
}
