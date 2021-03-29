import { fs, log, PATH } from '../common';

/**
 * Copy the bundled `monaco-editor` workers.
 */
export async function copyVs(options: { silent?: boolean } = {}) {
  const base = fs.resolve('.');
  const from = fs.join(PATH.NODE_MODULES, 'monaco-editor/min/vs/');
  const to = fs.resolve(PATH.STATIC.VS);

  if (!options.silent) {
    log.info();
    log.info.gray(`Copy ${log.cyan('Monaco')}`);
    log.info.gray(` • from: ${from}`);
    log.info.gray(` • to:   ${log.white(to.substring(base.length + 1))}`);
    log.info();
  }

  await fs.ensureDir(fs.dirname(to));
  await fs.copy(from, to);
}
