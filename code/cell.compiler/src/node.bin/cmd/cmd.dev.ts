import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Start development server (HMR)
 */
export async function dev(argv: t.Argv) {
  logger.clear();
  const { exports } = argv;
  const name = util.nameArg(argv) || 'dev';
  const config = await util.loadConfig(argv.config, { name });
  await Compiler.dev(config, { exports });
}
