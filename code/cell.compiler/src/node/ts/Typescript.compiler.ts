import { CompilerOptions } from 'typescript';
import { defaultValue, exec, fs, id, ProgressSpinner } from '../common';

export type TsCompiler = {
  tsconfig: {
    path: string;
    json(): Promise<TsConfig>;
  };

  declarations(
    outfile: string,
    options?: { silent?: boolean; clean?: boolean },
  ): Promise<TsCompilerDeclarationsResult>;
};

export type TsCompilerDeclarationsResult = {
  tsconfig: { path: string; json: TsConfig };
  outfile: string;
  error?: string;
};

export type TsConfig = {
  extends: string;
  include: string[];
  compilerOptions: CompilerOptions;
};

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export function compiler(tsconfig?: string) {
  const path = fs.resolve(tsconfig || 'tsconfig.json');

  const compiler: TsCompiler = {
    tsconfig: {
      path,
      async json() {
        if (!(await fs.pathExists(path))) throw new Error(`tsconfig file not found at: ${path}`);
        return (await fs.readJson(path)) as TsConfig;
      },
    },

    async declarations(outfile: string, options = {}) {
      outfile = fs.resolve(outfile);

      // Prepare [tsconfig].
      const tsconfig = await compiler.tsconfig.json();
      tsconfig.compilerOptions = tsconfig.compilerOptions || {};
      tsconfig.compilerOptions.emitDeclarationOnly = true;
      tsconfig.compilerOptions.outFile = outfile;
      delete tsconfig.compilerOptions.outDir;

      // Save [tsconfig] JSON.
      const project = fs.join(fs.dirname(compiler.tsconfig.path), `tsconfig.tmp.${id.shortid()}`);
      await fs.writeFile(project, JSON.stringify(tsconfig, null, '  '));

      // Run the command.
      let error: string | undefined;
      const spinner = ProgressSpinner({ label: 'building typescript declarations' });
      if (!options.silent) spinner.start();
      const cmd = exec.command(`tsc --project ${project}`);
      const res = await cmd.run({ cwd: fs.dirname(path), silent: true });
      spinner.stop();
      if (!res.ok) {
        error = res.errors.map((err) => err).join('\n');
      }

      // Finish up.
      if (!defaultValue(options.clean)) await fs.remove(project);
      return {
        tsconfig: { path: project, json: tsconfig },
        outfile,
        error,
      };
    },
  };

  return compiler;
}
