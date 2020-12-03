import { Compiler } from '@platform/cell.compiler';
import { CompilerModelBuilder } from '@platform/cell.compiler/lib/types';
import { fs } from '../../common';

export { Compiler };

/**
 * Helpers for compiling test bundles.
 */
export const CompileSamples = {
  Compiler,
  make,

  node: make(
    '/node.sample',
    Compiler.config('node')
      .namespace('sample')
      .entry('./src/test/TestCompile/sample.node/main')
      .target('node'),
  ),
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
