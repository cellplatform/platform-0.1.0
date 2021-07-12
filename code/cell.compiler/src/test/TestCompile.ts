import { Compiler } from '..';
import { t, fs } from '../node/common';

export { Compiler };

/**
 * Helpers for compiling test bundles.
 */
export const TestCompile = {
  Compiler,
  bundle,
  make,
};

/**
 * Helpers
 */

async function bundle(args: { config: t.CompilerModelBuilder; force?: boolean }) {
  const { config, force } = args;
  const outdir = fs.resolve(config.toObject().outdir || '');
  if (force || !(await fs.pathExists(outdir))) {
    await Compiler.bundle(config);
  }
}

function make(dir: string, config: t.CompilerModelBuilder) {
  dir = `dist/test/${dir.replace(/^\/*/, '')}`;
  config = config.outdir(dir);
  return {
    config,
    paths: config.toPaths(),
    bundle(args: { force?: boolean }) {
      const { force } = args;
      return bundle({ config, force });
    },
  };
}
