import { t, PathUtil, time } from '../common';
import { File } from '../File';

export const FilesystemIndexer = (args: { dir: string; fs: t.INodeFs }) => {
  const { fs, dir } = args;
  const baseDir = dir;

  const api: t.FilesystemIndexer = {
    dir,

    /**
     * Generate a directory listing manifest.
     */
    async manifest(options = {}) {
      const { filter } = options;

      const dir: string = await (async () => {
        if (!options.dir) return baseDir;
        let dir = options.dir;
        if (dir.startsWith(baseDir)) dir = dir.substring(baseDir.length);
        dir = fs.join(baseDir, dir);
        if (!(await fs.is.dir(dir))) dir = fs.dirname(dir);
        return dir;
      })();

      const paths = await PathUtil.files({ fs, dir, filter });
      const toFile = async (path: string) => File.toManifestFile({ fs, baseDir, path });
      const files = await Promise.all(paths.map(toFile));

      return {
        kind: 'dir',
        hash: { files: File.Hash.files(files) },
        dir: { indexedAt: time.now.timestamp },
        files,
      };
    },
  };

  return api;
};
