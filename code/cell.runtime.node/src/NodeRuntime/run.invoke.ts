import { exec, log, logger, t, time } from '../common';

/**
 * Execute the bundle within the given directory.
 */
export async function invoke(args: {
  cwd: string;
  manifest: t.BundleManifest;
  params?: t.JsonMap;
  silent?: boolean;
}) {
  const { silent, manifest, cwd, params } = args;

  /**
   * TODO 🐷
   * - insert params
   * - do within node.vm
   * - return value
   * - type
   * - node version on return
   */

  const cmd = `node ${manifest.entry}`;
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
