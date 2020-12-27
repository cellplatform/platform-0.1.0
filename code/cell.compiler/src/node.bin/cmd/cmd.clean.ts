import { fs, log, t, ProgressSpinner } from '../common';
import { Typescript } from '../../node/ts';

/**
 * Remove transient build artifacts.
 */
export async function clean(argv: t.Argv) {
  const spinner = ProgressSpinner({ label: 'cleaning...' });
  spinner.start();

  const base = fs.resolve('.');
  const paths = ['dist', 'node_modules/.cache', 'tmp/runtime.node'].map((path) => fs.resolve(path));

  await Promise.all(
    paths.map(async (path) => {
      if (await fs.pathExists(path)) {
        await fs.remove(path);
      }
    }),
  );

  paths.push(...(await Typescript.clean()));
  spinner.stop();

  // Log changes.
  log.info();
  log.info.gray('Deleted');
  paths.forEach((path) => {
    path = path.substring(base.length + 1);
    log.info.gray(`  ${base}/${log.white(path)}`);
  });
  log.info();
}
