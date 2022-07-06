import Factory from 'sys.fs/lib/web/TestFilesystem';
import { t } from '../common';

const PATH = {
  ROOT: 'tmp/test/Automerge',
};

export const TestFilesystem = {
  ...Factory('fs:dev.crdt'),
  PATH,

  /**
   * Clear test filees.
   */
  async clear(fs: t.Fs, options: { all?: boolean } = {}) {
    const { all } = options;
    const manifest = await fs.manifest();
    const files = manifest.files.filter((file) => {
      if (all) return true;
      return file.path.startsWith(PATH.ROOT);
    });
    const paths = files.map((file) => file.path);
    for (const path of paths) {
      await fs.delete(path);
    }
  },
};
