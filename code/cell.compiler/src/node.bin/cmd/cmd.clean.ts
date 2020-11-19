import { fs, log, t } from '../common';
import * as util from '../util';

/**
 * Remove transient build artifacts.
 */
export async function clean(argv: t.Argv) {
  const base = fs.resolve('.');
  const paths = ['dist', 'node_modules/.cache', 'tmp/runtime.node'].map((path) => fs.resolve(path));

  log.info();
  log.info.gray('Clean');
  paths.forEach((path) => {
    path = path.substring(base.length + 1);
    log.info.gray(`  ${base}/${log.white(path)}`);
  });
  log.info();

  await Promise.all(
    paths.map(async (path) => {
      if (await fs.pathExists(path)) {
        await fs.remove(path);
      }
    }),
  );
}
