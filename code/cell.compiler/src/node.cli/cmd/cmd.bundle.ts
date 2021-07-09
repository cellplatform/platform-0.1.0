import { Compiler } from '../../node/compiler';
import { constants, Package, t } from '../common';
import * as util from '../util';

/**
 * Bundle the project.
 */
export async function bundle(argv: t.Argv) {
  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'production');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  const declarationsOnly = argv.declarations || argv.d;
  const bump = util.bumpArg(argv);

  if (bump) await Package.bump(constants.PKG.PATH, bump);

  if (declarationsOnly) {
    await Compiler.bundleDeclarations(config);
  } else {
    await Compiler.bundle(config);
  }
}
