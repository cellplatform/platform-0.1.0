import { Compiler } from '@platform/cell.compiler';
import { CompilerModelBuilder } from '@platform/cell.compiler/lib/types';
import { fs } from '../../common';

const outdir = 'dist/test';

/**
 * Helpers for compiling test bundles.
 */
export const TestCompile = {
  /**
   * Compile the given bundle configuration if it does
   * not already exist.
   */
  async bundle(args: { config: CompilerModelBuilder; outdir?: string; force?: boolean }) {
    const dist = fs.resolve(args.outdir || outdir);
    if (args.force || !(await fs.pathExists(dist))) {
      await Compiler.bundle(args.config);
    }
  },

  /**
   * Sample [node-js] compilation.
   */
  node: {
    outdir: `${outdir}/sample`,

    get config() {
      return Compiler.config('node')
        .namespace('sample')
        .outdir(TestCompile.node.outdir)
        .entry('./src/test/TestCompile/sample.node/main')
        .target('node');
    },

    async bundle(force?: boolean) {
      const { config, outdir } = TestCompile.node;
      await TestCompile.bundle({ config, outdir, force });
    },
  },

  /**
   * Sample [node-js] compilation for VM2 (lib tests).
   */
  vm2: {
    outdir: `${outdir}/vm2`,

    get config() {
      return Compiler.config('vm2')
        .namespace('sample')
        .outdir(TestCompile.vm2.outdir)
        .entry('./src/test/TestCompile/sample.vm2/main')
        .target('node');
    },

    async bundle(force?: boolean) {
      const { config, outdir } = TestCompile.vm2;
      await TestCompile.bundle({ config, outdir, force });
    },
  },
};
