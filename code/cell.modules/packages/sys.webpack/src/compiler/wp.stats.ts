import { log } from '@platform/log/lib/server';
import * as filesize from 'filesize';
import { Stats as IStats, Compilation as ICompliation } from 'webpack';

import { R, time, t } from '../common';

export const stats = (input?: IStats | ICompliation): t.WebpackStats => {
  type Asset = { filename: string; bytes: number; size: string };

  const stats: ICompliation | undefined =
    typeof (input as any).compilation === 'object' ? (input as any).compilation : input;

  const ok = (stats?.errors || []).length === 0;
  const elapsed = stats ? stats.endTime - stats.startTime : -1;

  const res: t.WebpackStats = {
    ok,
    elapsed,

    log() {
      res.assets.log();
      log.info();
      res.errors.log();
    },

    get assets() {
      const list: Asset[] = [];
      stats?.assetsInfo.forEach((value, key) => {
        const bytes = value.size;
        if (typeof bytes === 'number') {
          list.push({ filename: key, bytes, size: filesize(bytes) });
        }
      });

      return {
        list,
        sortBySize: () => R.sortBy(R.prop('bytes'), list),
        sortByName: () => R.sortBy(R.prop('filename'), list),
        log(options: { indent?: number } = {}) {
          if (list.length === 0) {
            return;
          }
          const table = log.table({ border: false });
          const indent = options.indent ? ' '.repeat(options.indent) : '';
          list.forEach((item) => {
            table.add([`${indent}${item.filename}`, '  ', log.green(item.size)]);
          });
          table.log();
          log.info.gray(time.duration(elapsed).toString());
        },
      };
    },

    get errors() {
      const errors = stats?.errors || [];
      const list = errors.map((err) => {
        const { message, file, chunk, details, module } = err;
        return { message, file, chunk, details, module };
      });

      return {
        list,
        log() {
          list.forEach((err, i) => {
            log.info.gray(`${log.yellow('ERROR')} (${i + 1} of ${list.length})`);
            log.info(err.message);
            log.info();
          });
        },
      };
    },
  };

  return res;
};
