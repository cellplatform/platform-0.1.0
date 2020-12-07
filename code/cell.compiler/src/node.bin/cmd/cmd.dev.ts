import { Compiler } from '../../node/compiler';
import { t, port } from '../common';
import * as util from '../util';

const logger = util.logger;

/**
 * Start development server (HMR)
 */
export async function dev(argv: t.Argv) {
  logger.clear();
  const { exports } = argv;
  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'development');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  await Compiler.devserver(config, { exports });
}
