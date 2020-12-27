import { fs, t } from '../common';
import { compileDeclarations } from './compiler.declarations';

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export function compiler(tsconfig?: string) {
  const compiler: t.TsCompiler = {
    tsconfig: {
      path: fs.resolve(tsconfig || 'tsconfig.json'),
      async json() {
        const path = compiler.tsconfig.path;
        if (!(await fs.pathExists(path))) throw new Error(`tsconfig file not found at: ${path}`);
        return (await fs.readJson(path)) as t.TsConfigFile;
      },
    },

    /**
     * Compile typescript [.d.ts] declarations.
     */
    async declarations(args) {
      const tsconfig = compiler.tsconfig;
      return compileDeclarations({ ...args, tsconfig });
    },
  };

  return compiler;
}
