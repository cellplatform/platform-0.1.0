import { debounceTime, filter } from 'rxjs/operators';

import { log, watch } from '../common';
import * as t from './types';
import * as util from './util';

/**
 * Sarts a file-watcher on the directory.
 */
export async function watchDir(args: { dir: string; silent: boolean; sync: t.RunSyncCurry }) {
  const { dir, silent, sync } = args;

  const dir$ = watch.start({ pattern: `${dir}/*` }).events$.pipe(
    filter(e => e.isFile),
    filter(e => !e.name.startsWith('.')),
    debounceTime(1000),
  );

  dir$.subscribe(async e => {
    const { count, results, errors } = await sync({ silent: true });
    const { uploaded, deleted } = count;
    if (!silent) {
      let output = '';
      if (uploaded > 0) {
        output = `uploaded ${uploaded} ${util.plural.file.toString(uploaded)}`;
        output = `${output}: ${results.uploaded.join(', ')}`;
      }
      if (deleted > 0) {
        output = output ? `${output}, ` : output;
        output = `deleted  ${deleted} ${util.plural.file.toString(deleted)}`;
        output = `${output}: ${results.deleted.join(', ')}`;
      }
      output = output.trim();

      if (output) {
        let bullet = log.cyan;
        if (uploaded > 0 && deleted > 0) {
          bullet = log.yellow;
        }
        if (uploaded > 0 && deleted === 0) {
          bullet = log.green;
        }
        if (uploaded === 0 && deleted > 0) {
          bullet = log.red;
        }
        log.info.gray(`${bullet('•')} ${output}`);
      }

      if (errors.length > 0) {
        const errs = errors.map(item => item.error);
        log.info.yellow(`${log.yellow('•')} ${errs}`);
      }
    }
  });
}
