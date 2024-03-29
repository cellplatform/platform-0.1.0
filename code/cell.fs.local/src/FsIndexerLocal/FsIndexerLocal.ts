import { ManifestFiles, ManifestHash, PathUtil, t, time } from '../common';
import { ManifestFile } from '../ManifestFile';

export const FsIndexerLocal = (args: { dir: string; fs: t.INodeFs }) => {
  const { fs, dir } = args;
  const baseDir = dir;

  const api: t.FsIndexer = {
    dir,

    /**
     * Generate a directory listing manifest.
     */
    async manifest(options = {}) {
      const { filter } = options;

      /**
       * Wrangle the directory to index.
       */
      const dir: string = await (async () => {
        if (!options.dir) return baseDir; // No explicit directory specified, use root.

        // Trim and join to root diretory path.
        let dir = (options.dir ?? '').trim();
        if (dir.startsWith(baseDir)) dir = dir.substring(baseDir.length);
        dir = fs.join(baseDir, dir);

        // If the path does not exist, return no files.
        if (!(await fs.exists(dir))) return '';

        // If a file path was specified, step up to it's parent directory.
        if (await fs.is.file(dir)) dir = fs.dirname(dir);

        return dir;
      })();

      /**
       * Generate the file index.
       */
      const files: t.ManifestFile[] = await (async () => {
        if (!dir) return [];
        const paths = await PathUtil.files({ fs, dir, filter });
        const toFile = async (path: string) => ManifestFile.parse({ fs, baseDir, path });
        const files = ManifestFiles.sort(await Promise.all(paths.map(toFile)));
        return files;
      })();

      const indexedAt = time.now.timestamp;
      const info: t.DirManifestInfo = { indexedAt };
      const manifest: t.DirManifest = {
        kind: 'dir',
        dir: info,
        hash: ManifestHash.dir(info, files),
        files,
      };

      return manifest;
    },
  };

  return api;
};
