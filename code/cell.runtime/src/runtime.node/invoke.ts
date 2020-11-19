import { exec, fs, log, logger, PATH, Path, t, time } from './common';

/**
 * Execute the bundle within the given directory.
 */
export async function invoke(args: { dir: string; silent?: boolean }) {
  const { silent } = args;
  const dir = Path.dir(args.dir);

  const manifestPath = fs.join(dir.path, PATH.MANIFEST_FILENAME);
  if (!(await fs.pathExists(manifestPath))) {
    throw new Error(`A bundle manifest does not exist. ${manifestPath}`);
  }
  const manifest = (await fs.readJson(manifestPath)) as t.BundleManifest;

  const cmd = `node ${manifest.entry}`;
  const cwd = dir.path;

  const timer = time.timer();
  const res = await exec.command(cmd).run({ cwd, silent });

  const elapsed = timer.elapsed;
  const ok = res.code === 0;
  const errors = res.errors.map((message) => new Error(message));

  if (!args.silent) {
    const code = res.code === 0 ? log.green(0) : log.red(res.code);
    log.info();
    log.info.gray(`status code: ${code} (${elapsed.toString()})`);
    logger.errors(errors);
  }

  return { ok, manifest, errors };
}
