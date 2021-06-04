import { format, fs, log, Model, ProgressSpinner, t, time, toModel } from '../common';
import { Typescript } from '../ts';

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
  const bundleDir = Model(model).bundleDir;
  const declarations = model.declarations;

  if (declarations) {
    const ts = Typescript.compiler();

    const params: t.TscTranspileDeclarationsArgs[] = declarations.map((lib) => {
      const source = lib.include;
      const outdir = fs.join(bundleDir, 'types.d', lib.dir);
      return { source, outdir, silent: true };
    });

    const res = await Promise.all(params.map((params) => ts.declarations.transpile(params)));
    await ts.manifest.generate({ dir: bundleDir });

    if (!silent) {
      spinner.stop();
      log.info.gray(`Declarations (${log.yellow(timer.elapsed.toString())})`);
      res.forEach((res) => {
        const base = fs.resolve('.');
        const dir = format.filepath(res.out.dir.substring(base.length));
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
    dir: bundleDir,
  };
};
