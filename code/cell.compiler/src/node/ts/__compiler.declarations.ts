import { defaultValue, exec, fs, id, ProgressSpinner, t } from '../common';
import { formatDirs, TypeManifest } from '../manifest/TypeManifest';

/**
 * Compile typescript [.d.ts] declarations.
 */
export async function compileDeclarations(
  args: t.TsCompileDeclarationsArgs__OLD & { tsconfig: t.TscConfig },
): Promise<t.TsCompileDeclarationsResult__OLD> {
  const { model } = args;
  const dirs = formatDirs(args.base, args.dir);

  // Prepare [tsconfig].
  const json = await args.tsconfig.json();
  json.compilerOptions = json.compilerOptions || {};
  json.compilerOptions.emitDeclarationOnly = true;
  json.compilerOptions.outDir = fs.join(args.base, args.dir);
  if (args.include) {
    json.include = Array.isArray(args.include) ? args.include : [args.include];
  }

  // Save the transient [tsconfig] file.
  const tsconfig = {
    path: fs.join(fs.dirname(args.tsconfig.path), `tsconfig.tmp.${id.shortid()}`),
    json,
  };
  await fs.writeFile(tsconfig.path, JSON.stringify(json, null, '  '));

  const spinner = ProgressSpinner({ label: 'building declarations' });

  // Run the command.
  if (!args.silent) spinner.start();
  let error: string | undefined;
  const cmd = exec.command(`tsc --project ${tsconfig.path}`);
  const res = await cmd.run({ cwd: fs.dirname(args.tsconfig.path), silent: false });
  if (!res.ok) {
    const emitted = res.errors.map((err) => err).join('\n');
    error = `Failed to transpile declarations. ${emitted}`.trim();
  }

  // Rename files from ".d.ts" => ".d.txt" (mimetype: "plain/text").
  await Promise.all(
    (await fs.glob.find(`${dirs.base}/**/*.d.ts`)).map(async (from) => {
      const to = from.replace(/\.d\.ts$/, '.d.txt');
      await fs.rename(from, to);
    }),
  );

  // Save the type-declaration manifest, copying in all referenced type libs as well.
  const info = await TypeManifest.info(model?.entry?.main);
  const { manifest } = await TypeManifest.createAndSave({
    copyRefs: true,
    base: dirs.base,
    dir: dirs.dirname,
    model,
    info,
  });

  spinner.stop();
  if (!defaultValue(args.clean)) await fs.remove(tsconfig.path);

  // Finish up.
  return {
    tsconfig: tsconfig.json,
    output: { base: dirs.base, dir: dirs.join(), manifest },
    error,
  };
}
