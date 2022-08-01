import { Format, fs, log, ModelPaths, ProgressSpinner, t, time, toModel } from '../common';
import { Typescript } from '../ts';
import { Manifest } from '../Manifest';

/**
 * Bundle the typescript declarations (".d.ts") files for a project.
 */
export const bundleDeclarations: t.CompilerRunBundleDeclarations = async (input, options = {}) => {
  const { silent } = options;
  const timer = time.timer();

  const label = `compiling type declarations (${log.green('.d.ts')} files)...`;
  const spinner = ProgressSpinner({ label });
  if (!silent) {
    log.info();
    spinner.start();
  }

  const model = toModel(input);
  const distDir = ModelPaths(model).out.dist;
  const declarations = model.declarations;

  if (declarations) {
    const ts = Typescript.compiler();
    const dir = fs.join(distDir, 'types.d');

    // Transpile and assemble the ".d.ts" files.
    const params: t.TscTranspileDeclarationsArgs[] = declarations.map((lib) => {
      const source = lib.include;
      const outdir = fs.join(dir, lib.dir);
      return { source, outdir, silent: true };
    });
    const res = await Promise.all(params.map((params) => ts.declarations.transpile(params)));

    // Zip typelib folders.
    if (options.zip ?? true) {
      for (const typedir of await fs.glob.find(`${dir}/*/`)) {
        await fs.zip(typedir).save(`${typedir.replace(/\/$/, '')}.zip`);
        await fs.remove(typedir);
      }
    }

    // Create a manifest index.
    await Manifest.createAndSave({ dir });

    if (!silent) {
      spinner.stop();
      log.info.gray(`Declarations (${log.yellow(timer.elapsed.toString())})`);
      res.forEach((res) => {
        const base = fs.resolve('.');
        const dir = Format.filepath(res.out.dir.substring(base.length));
        log.info(`  ${dir}`);
      });
      log.info();
    }
  }

  // Finish up.
  spinner.stop();
  return {
    ok: true,
    elapsed: timer.elapsed.msec,
    model,
    dir: distDir,
  };
};
