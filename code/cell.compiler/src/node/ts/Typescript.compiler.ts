import { defaultValue, exec, fs, id, ProgressSpinner, t } from '../common';
import { TypeManifest } from '../manifest';

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
      const { model } = args;
      const dir = fs.resolve(args.dir);

      // Prepare [tsconfig].
      const json = await compiler.tsconfig.json();
      json.compilerOptions = json.compilerOptions || {};
      json.compilerOptions.emitDeclarationOnly = true;
      json.compilerOptions.outDir = dir;
      if (args.include) {
        json.include = Array.isArray(args.include) ? args.include : [args.include];
      }

      const tsconfig = {
        path: fs.join(fs.dirname(compiler.tsconfig.path), `tsconfig.tmp.${id.shortid()}`),
        json,
      };

      // Save [tsconfig] JSON.
      await fs.writeFile(tsconfig.path, JSON.stringify(json, null, '  '));

      const spinner = ProgressSpinner({ label: 'building typescript declarations' });
      if (!args.silent) spinner.start();

      // Run the command.
      let error: string | undefined;
      const cmd = exec.command(`tsc --project ${tsconfig.path}`);
      const res = await cmd.run({ cwd: fs.dirname(path), silent: false });
      if (!res.ok) {
        const emitted = res.errors.map((err) => err).join('\n');
        error = `Failed to transpile declarations. ${emitted}`.trim();
      }

      console.log('outdir', dir);

      const r = await TypeManifest.createAndSave({ sourceDir: dir, model });
      console.log('r', r);
      console.log('r', r.manifest.files);

      // Finish up.
      spinner.stop();
      if (!defaultValue(args.clean)) await fs.remove(tsconfig.path);
      return {
        tsconfig,
        dir: dir,
        error,
      };
    },
  };

  return compiler;
}
