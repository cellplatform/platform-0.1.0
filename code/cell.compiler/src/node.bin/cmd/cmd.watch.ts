import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Bundle and start file watcher.
 */
export async function watch(argv: t.Argv) {
  logger.clear();
  const name = util.nameArg(argv);
  const config = await util.loadConfig(argv.config, { name });
  await Compiler.watch(config);
}
