import { Compiler } from '../../node/Compiler';
import { constants, Package, t, log } from '../common';
import * as util from '../util';

/**
 * Bundle the project.
 */
export async function bundle(argv: t.Argv) {
  const PKG = constants.PKG;
  const version = { from: PKG.load().version || '', to: '' };

  const bump = util.bumpArg(argv);
  if (bump) {
    await Package.bump(PKG.PATH, bump);
    version.to = PKG.load().version || '';
  }

  const name = util.nameArg(argv, 'web');
  const mode = util.modeArg(argv, 'production');
  const config = (await util.loadConfig(argv.config, { name })).mode(mode);
  const declarationsOnly = argv.declarations || argv.d;

  if (declarationsOnly) {
    await Compiler.bundleDeclarations(config);
  } else {
    await Compiler.bundle(config);
  }

  const logVersion = version.to
    ? `${version.from} ➔ ${log.white(version.to)}`
    : `${version.from} (no change)`;
  log.info.gray(`package.json/version: ${logVersion}`);
}
