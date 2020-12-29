import { t } from '../../common';
import { Transpiler } from './TscCompiler.transpile';

/**
 * Tools for compiling ".d.ts" declarations
 */
export function Declarations(tsconfig: t.TsCompilerConfig) {
  const TscDeclarations: t.TscDeclarations = {
    /**
     * Run the compiler to produce ".d.ts" files only.
     */
    async transpile(args) {
      return Transpiler(tsconfig)({
        ...args,
        compilerOptions: { emitDeclarationOnly: true },
      });
    },
  };

  return TscDeclarations;
}
