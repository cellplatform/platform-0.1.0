import { fs, t } from '../../common';
import { compileDeclarations } from '../__compiler.declarations';
import { TscTranspiler } from './TscCompiler.transpile';
import { TscDeclarations } from './TscDeclarations';

/**
 * Create the typescript compiler.
 */
export function TscCompiler(tsconfigPath?: string) {
  const tsconfig: t.TsCompilerConfig = {
    path: fs.resolve(tsconfigPath || 'tsconfig.json'),
    async json() {
      const path = compiler.tsconfig.path;
      if (!(await fs.pathExists(path))) throw new Error(`tsconfig file not found at: ${path}`);
      return (await fs.readJson(path)) as t.TsConfigFile;
    },
  };

  const compiler: t.TscCompiler = {
    tsconfig,
    transpile: TscTranspiler(tsconfig),
    declarations: TscDeclarations(tsconfig),

    /**
     * Compile typescript [.d.ts] declarations.
     */
    async declarations_OLD(args) {
      /**
       * TODO 🐷 REMOVE
       */
      return compileDeclarations({ ...args, tsconfig });
    },
  };

  return compiler;
}
