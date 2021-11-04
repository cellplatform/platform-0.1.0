import { expect, Filesystem, rx, t, TestFs, TestPrep, DEFAULT } from '../test';

describe('BusController', function () {
  const bus = rx.bus<t.SysFsEvent>();
  const nodefs = TestFs.node;

  it('id (specified)', () => {
    const id = 'foo';
    const driver = TestFs.local;
    const index = TestFs.index(driver.dir);
    const controller = Filesystem.Controller({ id, driver, bus, index });
    expect(controller.id).to.eql(id);
    controller.dispose();
  });

  it.only('id (generated)', () => {
    const test = (id?: string) => {
      const driver = TestFs.local;
      const index = TestFs.index(driver.dir);
      const controller = Filesystem.Controller({ id, driver, bus, index });
      expect(controller.id).to.eql(DEFAULT.FILESYSTEM_ID);
      controller.dispose();
    };

    test(undefined);
    test('');
    test('  ');
  });

  it('filter (global)', async () => {
    const id = 'foo';
    const fs = TestFs.local;

    let allow = true;
    const index = TestFs.index(fs.dir);
    const controller = Filesystem.Controller({ id, driver: fs, index, bus, filter: (e) => allow });
    const events = Filesystem.Events({ id, bus });

    const res1 = await events.io.info.get();
    allow = false;
    const res2 = await events.io.info.get({ timeout: 10 });
    controller.dispose();

    expect(res1.error).to.eql(undefined);
    expect(res2.error?.code).to.eql('client/timeout');
    expect(res2.error?.message).to.include('timed out');
  });

  it('distinct (by filesystem "id")', async () => {
    const one = await TestPrep({ id: 'one', dir: 'foo' });
    const two = await TestPrep({ id: 'two', dir: 'bar' });

    const info1 = await one.events.io.info.get();
    const info2 = await two.events.io.info.get();

    one.dispose();
    two.dispose();

    expect(info1.id).to.eql('one');
    expect(info2.id).to.eql('two');

    expect(info1.fs?.id).to.eql('one');
    expect(info2.fs?.id).to.eql('two');

    expect(info1.fs?.dir).to.match(/\/foo$/);
    expect(info2.fs?.dir).to.match(/\/bar$/);
  });

  it('controller.fs', async () => {
    const mock = await TestPrep();
    await mock.reset();

    const root = mock.controller.dir;
    const png = await mock.readFile('static.test/child/tree.png');

    const fs1 = mock.controller.fs();
    const fs2 = mock.controller.fs('images');
    const fs3 = mock.controller.fs({ dir: 'images/' });

    await fs1.write('images/tree1.png', png.data);
    await fs2.write('tree2.png', png.data);
    await fs3.write('tree3.png', png.data);

    const file1 = await mock.readFile(nodefs.join(root, 'images/tree1.png'));
    const file2 = await mock.readFile(nodefs.join(root, 'images/tree2.png'));
    const file3 = await mock.readFile(nodefs.join(root, 'images/tree3.png'));

    expect(file1.hash).to.eql(png.hash);
    expect(file2.hash).to.eql(png.hash);
    expect(file3.hash).to.eql(png.hash);

    await mock.dispose();
  });
});
