import { IRouterMock, RouterMock } from '@platform/cell.router/lib/test/RouterMock';

import { Path, rx, t, TestFs } from '../test';
import { Filesystem } from '..';

type FilesystemId = string;

export const TestPrep = async (options: { id?: FilesystemId; dir?: string } = {}) => {
  const bus = rx.bus<t.SysFsEvent>();
  const id = options.id ?? 'foo';
  const driver = !options.dir
    ? TestFs.local
    : TestFs.FsDriverLocal({
        dir: TestFs.node.join(TestFs.tmp, options.dir),
        fs: TestFs.node,
      });

  const controller = Filesystem.Controller({ id, bus, driver });
  const events = Filesystem.Events({ id, bus });

  let server: IRouterMock | undefined;

  const api = {
    bus,
    controller,
    events,

    dir: Path.ensureSlashEnd(driver.dir),
    rootDir: Path.ensureSlashEnd(TestFs.local.dir),

    fs: TestFs.node,
    readFile: TestFs.readFile,

    fileExists(path: string) {
      return TestFs.node.pathExists(TestFs.join(driver.dir, path));
    },

    async copy(source: string, target: string) {
      const { hash, data } = await TestFs.readFile(source);
      const res = await events.io.write.fire({ path: target, hash, data });
      return res.files[0];
    },

    async server() {
      if (server) return server;
      return (server = await RouterMock.create());
    },

    async reset() {
      await TestFs.reset();
    },

    async dispose() {
      controller.dispose();
      events.dispose();
      await server?.dispose();
    },
  };

  return api;
};
