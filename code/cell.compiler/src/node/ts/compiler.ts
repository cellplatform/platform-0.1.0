import { defaultValue, exec, fs, id, ProgressSpinner, t } from '../common';

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

  const compiler: t.TsCompiler = {
    tsconfig: {
      path,
      async json() {
        if (!(await fs.pathExists(path))) throw new Error(`tsconfig file not found at: ${path}`);
        return (await fs.readJson(path)) as t.TsConfigFile;
      },
    },

    /**
     * Compile typescript [.d.ts] declarations.
     */
    async declarations(args) {
      const outfile = fs.resolve(args.outfile);

      // Prepare [tsconfig].
      const tsconfig = await compiler.tsconfig.json();
      tsconfig.compilerOptions = tsconfig.compilerOptions || {};
      tsconfig.compilerOptions.emitDeclarationOnly = true;
      tsconfig.compilerOptions.outFile = outfile;
      delete tsconfig.compilerOptions.outDir;
      if (args.include) {
        tsconfig.include = Array.isArray(args.include) ? args.include : [args.include];
      }

      // Save [tsconfig] JSON.
      const project = fs.join(fs.dirname(compiler.tsconfig.path), `tsconfig.tmp.${id.shortid()}`);
      await fs.writeFile(project, JSON.stringify(tsconfig, null, '  '));

      const spinner = ProgressSpinner({ label: 'building typescript declarations' });
      if (!args.silent) spinner.start();

      // Run the command.
      let error: string | undefined;
      const cmd = exec.command(`tsc --project ${project}`);
      const res = await cmd.run({ cwd: fs.dirname(path), silent: false });
      if (!res.ok) {
        const emitted = res.errors.map((err) => err).join('\n');
        error = `Failed to transpile declarations. ${emitted}`.trim();
      }

      // Finish up.
      spinner.stop();
      if (!defaultValue(args.clean)) await fs.remove(project);
      return {
        tsconfig: { path: project, json: tsconfig },
        outfile,
        error,
      };
    },
  };

  return compiler;
}
