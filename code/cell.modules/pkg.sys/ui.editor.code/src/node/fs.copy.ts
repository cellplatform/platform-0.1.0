import { fs } from '@platform/fs';
import { log } from '@platform/log/lib/server';

/**
 * File copy helpers.
 */
export const copy = {
  vs(target: string | string[], options: { silent?: boolean; to?: string | string[] } = {}) {
    const base = fs.resolve('.');
    const from = fs.resolve('../../../../node_modules/monaco-editor/min/vs/');
    const to = asArray(target).map((path) => fs.resolve(path));

    if (!options.silent) {
      log.info();
      log.info.gray('Copy web-workers');
      log.info.gray(` • from: ${from}`);
      to.forEach((path) => {
        const to = path.substring(base.length + 1);
        log.info.gray(` • to:   ${log.white(to)}`);
      });
    }

    to.forEach((path) => {
      fs.ensureDirSync(fs.dirname(path));
      fs.copySync(from, path);
    });
  },
};

/**
 * Helpers
 */

const asArray = <T>(input?: T | T[]) =>
  (Array.isArray(input) ? input : [input]).filter(Boolean) as T[];
