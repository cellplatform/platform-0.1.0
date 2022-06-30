import { slug, rx, Filesystem, t } from '../common';

type Milliseconds = number;

const PATH = {
  ROOT: 'tmp/test/Automerge',
};

export const TestFilesystem = {
  id: 'fs:dev.sys.crdt',
  PATH,

  /**
   * Initialize a new test filesystem instance.
   *
   */
  init(options: { bus?: t.EventBus<any>; timeout?: Milliseconds } = {}) {
    const { timeout } = options;
    const bus = options.bus ?? rx.bus();

    const instance: t.FsViewInstance = {
      bus,
      id: `foo.${slug()}`,
      fs: TestFilesystem.id,
    };

    const { events, fs, ready } = Filesystem.IndexedDb.create({ bus, fs: instance.fs });
    return { bus, instance, events, fs, ready };
  },

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
