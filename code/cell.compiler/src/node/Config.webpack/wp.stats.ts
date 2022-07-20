import { fs, Logger, R, t } from '../common';

const filesize = fs.size.toString;

export const stats = (input?: t.WpStats | t.WpCompilation): t.WebpackStats => {
  type Asset = { filename: string; bytes: number; size: string };

  const stats: t.WpCompilation | undefined =
    typeof (input as any).compilation === 'object' ? (input as any).compilation : input;

  const res: t.WebpackStats = {
    ok: (stats?.errors || []).length === 0,
    elapsed: stats ? stats.endTime - stats.startTime : -1,

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

      const assets: t.WebpackStats['assets'] = {
        list,
        bytes: list.reduce((acc, next) => acc + next.bytes, 0),
        sortBySize: () => R.sortBy(R.prop('bytes'), list),
        sortByName: () => R.sortBy(R.prop('filename'), list),
      };

      return assets;
    },

    get errors() {
      const errors = stats?.errors || [];
      return errors.map((err) => {
        const { message, file, chunk, details, module } = err;
        return { message, file, chunk, details, module };
      });
    },
  };

  return res;
};
