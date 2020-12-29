import { t } from '../../common';
import { transpile } from '../compiler/TscCompiler.transpile';

/**
 * Tools for compiling ".d.ts" declarations
 */
export function create(tsconfig: t.TsCompilerConfig) {
  const TscDeclarations: t.TscDeclarations = {
    /**
     * Run the compiler.
     */
    async transpile(args) {
      const compilerOptions: t.CompilerOptions = { emitDeclarationOnly: true };
      return transpile({ ...args, compilerOptions, tsconfig });
    },
  };

  return TscDeclarations;
}
