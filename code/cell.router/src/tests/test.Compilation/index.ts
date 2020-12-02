import { Compiler } from '@platform/cell.compiler';
import { CompilerModelBuilder } from '@platform/cell.compiler/lib/types';

import { fs } from '../../common';

const outdir = 'dist/test';

/**
 * Helpers for compiling test bundles.
 */
export const TestCompile = {
  /**
   * Sample [node-js] compilation.
   */
  node: {
    dir: `${outdir}/node`,

    get config() {
      return Compiler.config()
        .namespace('test.node')
        .outdir(outdir)
        .entry('./src/tests/test.Compilation/sample.node/main')
        .target('node');
    },

    async bundle(force?: boolean) {
      const outdir = TestCompile.node.dir;
      const config = TestCompile.node.config;
      await bundle({ config, outdir, force });
    },
  },
};

/**
 * Helpers
 */

async function bundle(args: { force?: boolean; config: CompilerModelBuilder; outdir: string }) {
  const dist = fs.resolve(args.outdir);
  if (args.force || !(await fs.pathExists(dist))) {
    await Compiler.bundle(args.config);
  }
}
