import { Compilation as ICompliation, Stats as IStats } from 'webpack';

import { log, R, t, time, fs, path } from '../common';

const filesize = fs.size.toString;

export const stats = (input?: IStats | ICompliation): t.WebpackStats => {
  type Asset = { filename: string; bytes: number; size: string };

  const stats: ICompliation | undefined =
    typeof (input as any).compilation === 'object' ? (input as any).compilation : input;

  const res: t.WebpackStats = {
    ok: (stats?.errors || []).length === 0,
    elapsed: stats ? stats.endTime - stats.startTime : -1,

    log() {
      res.assets.log({ indent: 2 });
      log.info();
      res.errors.log();
    },

    output: {
      path: stats?.outputOptions?.path || '',
      publicPath: stats?.outputOptions?.publicPath?.toString() || '',
    },

    get assets() {
      const list: Asset[] = [];
      stats?.assetsInfo.forEach((value, key) => {
        const bytes = value.size;
        if (typeof bytes === 'number') {
          list.push({ filename: key, bytes, size: filesize(bytes) });
        }
      });

      const assets = {
        list,
        bytes: list.reduce((acc, next) => acc + next.bytes, 0),
        sortBySize: () => R.sortBy(R.prop('bytes'), list),
        sortByName: () => R.sortBy(R.prop('filename'), list),
        log(options: { indent?: number } = {}) {
          if (list.length === 0) {
            return;
          }
          const elapsed = time.duration(res.elapsed).toString();
          const table = log.table({ border: false });
          const indent = options.indent ? ' '.repeat(options.indent) : '';
          list.forEach((item) => {
            const filename = log.gray(`${indent}• ${log.white(item.filename)}`);
            table.add([filename, '    ', log.green(item.size)]);
          });
          table.add(['', '', log.cyan(filesize(assets.bytes))]);

          log.info();
          log.info.gray('Files');
          log.info.gray(`  ${path.trimBaseDir(res.output.path)}`);
          table.log();
          log.info.gray(`Bundled in ${log.yellow(elapsed)}`);
        },
      };
      return assets;
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
            log.info.gray(`${log.red('ERROR')} ${log.yellow(i + 1)} of ${list.length}`);
            log.info(err.message);
            log.info();
          });
        },
      };
    },
  };

  return res;
};
