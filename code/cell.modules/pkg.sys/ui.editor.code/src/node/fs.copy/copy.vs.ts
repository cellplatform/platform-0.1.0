import { fs, log, NODE_MODULES } from '../common';

/**
 * Copy the bundled `monaco-editor` workers.
 */
export function copyVs(options: { silent?: boolean } = {}) {
  const base = fs.resolve('.');
  const from = fs.join(NODE_MODULES, 'monaco-editor/min/vs/');
  const to = fs.resolve('./static/vs');

  if (!options.silent) {
    log.info();
    log.info.gray('Copy webworkers');
    log.info.gray(` • from: ${from}`);
    log.info.gray(` • to:   ${log.white(to.substring(base.length + 1))}`);
    log.info();
  }

  fs.ensureDirSync(fs.dirname(to));
  fs.copySync(from, to);
}
