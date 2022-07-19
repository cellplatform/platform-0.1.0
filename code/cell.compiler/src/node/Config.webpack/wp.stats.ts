import { log, R, fs, t, time, Path, Logger, DEFAULT } from '../common';

const filesize = fs.size.toString;

export const stats = (input?: t.WpStats | t.WpCompilation): t.WebpackStats => {
  type Asset = { filename: string; bytes: number; size: string };

  const stats: t.WpCompilation | undefined =
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
          if (list.length === 0) return;

          const bundleDir = Path.trimBase(res.output.path);
          const elapsed = time.duration(res.elapsed).toString();
          const table = log.table({ border: false });
          const indent = options.indent ? ' '.repeat(options.indent) : '';

          const toSizeColor = (bytes: number) => {
            const size = filesize(bytes);
            const KB = 1000;
            if (bytes > 1000 * KB) return log.red(size);
            if (bytes > 500 * KB) return log.yellow(size);
            if (bytes < 100 * KB) return log.green(size);
            return log.gray(size);
          };

          list.forEach((item) => {
            const extIndex = item.filename.lastIndexOf('.');
            const ext = item.filename.substring(extIndex);
            const name = item.filename.substring(0, extIndex);
            const filename = log.gray(`${indent}• ${log.white(name)}${ext}`);
            table.add([filename, '    ', toSizeColor(item.bytes)]);
          });

          const totalSize = filesize(assets.bytes);

          table.add(['', '', log.white('-'.repeat(totalSize.length))]);
          table.add(['', '', log.white(totalSize)]);

          log.info();
          log.info.gray('Files');
          log.info.gray(`  ${bundleDir}`);
          table.log();
          log.info.gray(`Bundled in ${log.yellow(elapsed)}`);
          log.info.gray(`Manifest:  ${fs.join(bundleDir, DEFAULT.FILE.JSON.MANIFEST)}`);
          log.info.gray(`Zipped:    ${`${bundleDir}.bundle`}`);
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
        log: () => Logger.errors(list),
      };
    },
  };

  return res;
};
