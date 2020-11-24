import { Compiler } from '../../node/Compiler';
import { t } from '../common';
import * as util from '../util';

/**
 * Bundle the project.
 */
export async function bundle(argv: t.Argv) {
  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'production');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  await Compiler.bundle(config);
}
