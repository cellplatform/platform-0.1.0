import { Compiler } from '@platform/cell.compiler';
import { CompilerModelBuilder } from '@platform/cell.compiler/lib/types';
import { fs } from '../common';

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

async function bundle(args: { config: CompilerModelBuilder; force?: boolean }) {
  const outdir = fs.resolve(args.config.toObject().outdir || '');
  if (args.force || !(await fs.pathExists(outdir))) {
    await Compiler.bundle(args.config);
  }
}

function make(dir: string, config: CompilerModelBuilder) {
  const outdir = `dist/test/${dir.replace(/^\/*/, '')}`;
  config = config.outdir(outdir);
  return {
    config,
    outdir: `${outdir}/${config.toObject().target || ''}`,
    bundle: (force?: boolean) => bundle({ config, force }),
  };
}
