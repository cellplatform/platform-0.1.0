import { Filesystem, t } from '../common';

const PATH = {
  ROOT: 'tmp/test/Automerge',
};

export const TestFilesystem = {
  id: 'fs:dev.sys.crdt',
  PATH,

  /**
   * Initialize a new test filesystem instance.
   */
  async create(bus: t.EventBus, options: { clear?: boolean } = {}) {
    const id = TestFilesystem.id;
    const store = await Filesystem.IndexedDb.create({ bus, fs: id }).ready();
    const fs = store.fs;
    if (options.clear) await TestFilesystem.clear(fs);
    return fs;
  },

  /**
   * Clear test filees.
   */
  async clear(fs: t.Fs) {
    const manifest = await fs.manifest();
    const files = manifest.files.filter((file) => file.path.startsWith(PATH.ROOT));
    const paths = files.map((file) => file.path);
    for (const path of paths) {
      await fs.delete(path);
    }
  },
};
