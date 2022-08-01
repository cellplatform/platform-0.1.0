import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

const logger = util.Logger;

/**
 * Bundle and start file watcher.
 */
export async function watch(argv: t.Argv) {
  logger.clear();
  const name = util.nameArg(argv, 'node');
  const mode = util.modeArg(argv, 'development');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  await Compiler.watch(config);
}
