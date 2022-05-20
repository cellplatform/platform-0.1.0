import { t, rx, slug } from '../common';
import { Filesystem } from '../FsBus.IndexedDb';

type Milliseconds = number;

/**
 * Helpers for testing UI components.
 */
export const TestFs = {
  id: 'fs:sys.fs.dev',

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
      fs: TestFs.id,
    };

    // Initialize the filesystem controller.
    const promise = Filesystem.create({ bus, id: instance.fs });
    const events = Filesystem.Events({ bus, id: instance.fs });
    const fs = events.fs({ timeout });

    // Finish up.
    return { bus, instance, events, fs, promise };
  },
};
