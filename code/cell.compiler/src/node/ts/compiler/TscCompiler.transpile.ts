import { exec, fs, ProgressSpinner, slug, t } from '../../common';
import { generateManifest } from './TscCompiler.manifest';

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export function TscTranspiler(tsconfig: t.TscConfig): t.TscTranspile {
  return async (args) => {
    const { model } = args;
    const outdir = fs.resolve(args.outdir);
    const spinner = ProgressSpinner({ label: args.spinnerLabel || 'building typescript' });

    // Prepare [tsconfig].
    const json = await tsconfig.json();
    json.compilerOptions = { ...(json.compilerOptions || {}), ...args.compilerOptions };
    json.compilerOptions.outDir = outdir;
    if (args.source) {
      json.include = Array.isArray(args.source) ? args.source : [args.source];
    }

    // Save the transient [tsconfig] file.
    const path = fs.join(fs.dirname(tsconfig.path), `tsconfig.tmp.${slug()}`);
    await fs.writeFile(path, JSON.stringify(json, null, '  '));

    // Run the command.
    if (!args.silent) spinner.start();
    let error: string | undefined;
    const cmd = exec.command(`tsc --project ${path}`);
    const cwd = fs.dirname(path);
    const res = await cmd.run({ cwd, silent: true });
    if (!res.ok) {
      const emitted = res.errors.map((err) => err).join('\n');
      error = `Failed to transpile typescript. ${emitted}`.trim();
    }

    // Save the type-declaration manifest.
    const { manifest } = await generateManifest({ outdir, model });

    // Clean up.
    await fs.remove(path);
    spinner.stop();

    // Finish up.
    return {
      tsconfig: json,
      out: { dir: outdir, manifest },
      error,
    };
  };
}
