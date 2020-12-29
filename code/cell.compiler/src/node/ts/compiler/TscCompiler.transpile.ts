import { exec, fs, ProgressSpinner, slug, t } from '../../common';
import { TypeManifest } from '../../manifest';

/**
 * Wrapper for running the `tsc` typescript compiler
 * with a programmatic API.
 *
 * NOTE:
 *    Uses [exec] child_process under the hood.
 *
 */
export async function transpile(
  args: t.TscTranspileArgs & { tsconfig: t.TsCompilerConfig },
): Promise<t.TscTranspileResult> {
  const { model } = args;
  const outdir = fs.resolve(args.outdir);
  const spinner = ProgressSpinner({ label: args.spinnerLabel || 'building typescript' });

  // Prepare [tsconfig].
  const json = await args.tsconfig.json();
  json.compilerOptions = { ...(json.compilerOptions || {}), ...args.compilerOptions };
  json.compilerOptions.outDir = outdir;
  if (args.source) {
    json.include = Array.isArray(args.source) ? args.source : [args.source];
  }

  // Save the transient [tsconfig] file.
  const tsconfig = {
    path: fs.join(fs.dirname(args.tsconfig.path), `tsconfig.tmp.${slug()}`),
    json,
  };
  await fs.writeFile(tsconfig.path, JSON.stringify(json, null, '  '));

  // Run the command.
  if (!args.silent) spinner.start();
  let error: string | undefined;
  const cmd = exec.command(`tsc --project ${tsconfig.path}`);
  const res = await cmd.run({ cwd: fs.dirname(args.tsconfig.path), silent: false });
  if (!res.ok) {
    const emitted = res.errors.map((err) => err).join('\n');
    error = `Failed to transpile typescript. ${emitted}`.trim();
  }

  // Save the type-declaration manifest, copying in all referenced type libs as well.
  const info = await TypeManifest.info(model?.entry?.main);
  const { manifest } = await TypeManifest.createAndSave({
    base: fs.dirname(outdir),
    dir: fs.basename(outdir),
    model,
    info,
  });

  // Clean up.
  spinner.stop();
  await fs.remove(tsconfig.path);

  // Finish up.
  return {
    tsconfig: json,
    out: { dir: outdir, manifest },
    error,
  };
}
