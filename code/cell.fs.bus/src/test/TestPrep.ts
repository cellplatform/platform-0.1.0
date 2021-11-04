import { IRouterMock, RouterMock } from '@platform/cell.router/lib/test/RouterMock';

import { Path, rx, t, TestFs } from '../test';
import { Filesystem } from '../node';

export const TestPrep = async (options: { id?: string; dir?: string } = {}) => {
  const bus = rx.bus<t.SysFsEvent>();
  const id = options.id ?? 'foo';
  const fs = !options.dir
    ? TestFs.driver
    : TestFs.FsDriverLocal({
        dir: TestFs.node.join(TestFs.tmp, options.dir),
        fs: TestFs.node,
      });

  const controller = Filesystem.Controller({ id, bus, driver: fs });
  const events = Filesystem.Events({ id, bus });

  let server: IRouterMock | undefined;

  const api = {
    bus,
    controller,
    events,

    dir: Path.ensureSlashEnd(fs.dir),
    rootDir: Path.ensureSlashEnd(TestFs.driver.dir),

    fs: TestFs.node,
    readFile: TestFs.readFile,

    fileExists(path: string) {
      return TestFs.node.pathExists(TestFs.join(fs.dir, path));
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
