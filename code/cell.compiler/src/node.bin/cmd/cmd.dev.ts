import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Start development server (HMR)
 */
export async function dev(argv: t.Argv) {
  logger.clear();
  const name = util.nameArg(argv);
  const config = await util.loadConfig(argv.config, { name });
  config.mode('development');
  await Compiler.dev(config);
}
