import { t, log, PATHS, fs } from '../common';

/**
 * List the available templates.
 */
export async function ls(argv: t.Argv) {
  const root = PATHS.templates;

  const paths = await fs.glob.find(`${root}/*/`);
  log.info();
  paths
    .map((path) => fs.basename(path))
    .forEach((dirname) => {
      log.info.gray(` • ${fs.basename(root)}/${log.white(dirname)}`);
    });
}
