import { t } from '../../common';
import { TscTranspiler } from './TscCompiler.transpile';
import { TscCopy } from './TscCopy';

/**
 * Tools for compiling ".d.ts" declarations
 */
export function TscDeclarations(tsconfig: t.TscConfig) {
  const TscDeclarations: t.TscDeclarations = {
    /**
     * Run the compiler to produce ".d.ts" files only.
     */
    async transpile(args) {
      const res = await TscTranspiler(tsconfig)({
        ...args,
        compilerOptions: { emitDeclarationOnly: true },
        transformPath: (path) => path.replace(/\.d\.ts$/, '.d.txt'),
      });

      if (args.copyRefs ?? true) {
        await TscCopy.refs({ sourceDir: res.out.dir });
      }

      return res;
    },
  };

  return TscDeclarations;
}
