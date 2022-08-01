import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

const logger = util.Logger;

/**
 * Start development server (HMR)
 */
export async function dev(argv: t.Argv) {
  logger.clear();
  const { exports } = argv;
  const port = typeof argv.port === 'number' ? argv.port : undefined;
  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'development');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  await Compiler.devserver(config, { exports, port });
}
