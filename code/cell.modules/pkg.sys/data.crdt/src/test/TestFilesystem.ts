import { slug, rx, Filesystem, t } from '../common';

type Milliseconds = number;

const PATH = {
  ROOT: 'tmp/test/Automerge',
};

export type TestFilesystem = {
  bus: t.EventBus<any>;
  instance: t.FsViewInstance;
  events: t.SysFsEvents;
  fs: t.Fs;
  ready: () => Promise<TestFilesystem>;
};

export const TestFilesystem = {
  id: 'fs:dev.sys.crdt',
  PATH,

  /**
   * Initialize a new test filesystem instance.
   *
   */
  init(options: { bus?: t.EventBus<any>; timeout?: Milliseconds } = {}): TestFilesystem {
    const { timeout } = options;
    const bus = options.bus ?? rx.bus();

    const instance: t.FsViewInstance = {
      bus,
      id: `foo.${slug()}`,
      fs: TestFilesystem.id,
    };

    const res = Filesystem.IndexedDb.create({ bus, fs: instance.fs });
    const { events, fs } = res;
    const ready = async () => {
      await res.ready();
      return api;
    };

    const api: TestFilesystem = { bus, instance, events, fs, ready };
    return api;
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
