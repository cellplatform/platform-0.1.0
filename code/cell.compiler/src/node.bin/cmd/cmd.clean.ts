import { fs, log, t } from '../common';
import * as util from '../util';

/**
 * Remove transient build artifacts.
 */
export async function clean(argv: t.Argv) {
  const paths = ['dist', 'node_modules/.cache'].map((path) => fs.resolve(path));

  log.info();
  log.info.gray('Clean');
  paths.forEach((path) => {
    log.info(`  ${path}`);
  });
  log.info();

  await Promise.all(paths.map((path) => fs.remove(path)));
}
