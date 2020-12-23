import { fs, log, PATH } from '../common';

/**
 * Copy the bundled `monaco-editor` workers.
 */
export function copyVs(options: { silent?: boolean } = {}) {
  const base = fs.resolve('.');
  const from = fs.join(PATH.NODE_MODULES, 'monaco-editor/min/vs/');
  const to = fs.resolve(PATH.STATIC.VS);

  if (!options.silent) {
    log.info();
    log.info.gray('Copy Monaco');
    log.info.gray(` • from: ${from}`);
    log.info.gray(` • to:   ${log.white(to.substring(base.length + 1))}`);
    log.info();
  }

  fs.ensureDirSync(fs.dirname(to));
  fs.copySync(from, to);
}
