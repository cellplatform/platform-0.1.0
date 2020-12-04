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
  const outdir = fs.resolve(args.config.toObject().outdir || '');
  if (args.force || !(await fs.pathExists(outdir))) {
    await Compiler.bundle(args.config);
  }
}

function make(dir: string, config: t.CompilerModelBuilder) {
  const outdir = `dist/test/${dir.replace(/^\/*/, '')}`;
  config = config.outdir(outdir);
  return {
    config,
    outdir: `${outdir}/${config.toObject().target || ''}`,
    bundle: (force?: boolean) => bundle({ config, force }),
  };
}
