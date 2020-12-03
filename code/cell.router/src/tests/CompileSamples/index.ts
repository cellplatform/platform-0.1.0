import { Compiler } from '@platform/cell.compiler';
import { CompilerModelBuilder } from '@platform/cell.compiler/lib/types';
import { fs } from '../../common';

/**
 * Helpers for compiling test bundles.
 */
export const CompileSamples = {
  make,

  node: make(
    '/node.sample',
    Compiler.config('node')
      .namespace('sample')
      .entry('./src/test/TestCompile/sample.node/main')
      .target('node'),
  ),
  /**
   * Sample [node-js] compilation for VM2 (lib tests).
   */
  vm2: make(
    '/node.vm2',
    Compiler.config('vm2')
      .namespace('sample')
      .entry('./src/test/TestCompile/sample.vm2/main')
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
