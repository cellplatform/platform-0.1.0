import { t, rx, slug } from '../common';
import { Filesystem } from '../FsBus.IndexedDb';

type Milliseconds = number;

/**
 * Helpers for testing UI components.
 */
export const TestFilesystem = {
  id: 'fs:sys.dev',

  /**
   * Initialize a new test filesystem view instance.
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

    const { events, fs, ready } = Filesystem.create({ bus, fs: instance.fs });
    return { bus, instance, events, fs, ready };
  },
};
