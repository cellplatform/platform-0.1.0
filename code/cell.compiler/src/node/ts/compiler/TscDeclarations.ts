import { t } from '../../common';
import { TscTranspiler } from './TscCompiler.transpile';

/**
 * Tools for compiling ".d.ts" declarations
 */
export function TscDeclarations(tsconfig: t.TsCompilerConfig) {
  const TscDeclarations: t.TscDeclarations = {
    /**
     * Run the compiler to produce ".d.ts" files only.
     */
    async transpile(args) {
      return TscTranspiler(tsconfig)({
        ...args,
        compilerOptions: { emitDeclarationOnly: true },
      });
    },
  };

  return TscDeclarations;
}
