import { slug, rx, t } from '../common';
import { Filesystem } from '../FsBus.IndexedDb';
import { TestFilesystem } from './types';

type FilesystemId = string;
type Milliseconds = number;

/**
 * Helpers for generating a test filesystem with useful testing objects.
 */
export function TestFilesystemFactory(id: FilesystemId = 'fs:dev') {
  return {
    id,

    /**
     * Initialize a new test filesystem instance.
     */
    init(options: { bus?: t.EventBus<any>; timeout?: Milliseconds } = {}): TestFilesystem {
      const { timeout } = options;
      const bus = options.bus ?? rx.bus();

      const res = Filesystem.create({ bus, fs: id });
      const { events, fs } = res;

      const ready = async () => {
        await res.ready();
        return filesystem;
      };

      const instance = (id?: string): t.FsViewInstance => {
        return {
          bus,
          fs: filesystem.id,
          id: id ?? `foo.${slug()}`,
        };
      };

      const filesystem: TestFilesystem = { id, bus, events, fs, ready, instance };
      return filesystem;
    },
  };
}
