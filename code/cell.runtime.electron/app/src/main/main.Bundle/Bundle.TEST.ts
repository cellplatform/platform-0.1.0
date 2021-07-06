import { Bundle } from '.';
import { expect, fs, Mock, Paths, rx, slug, t, TestSample, Uri } from '../../test';

describe.only('main.Bundle', function () {
  this.timeout(30000);
  const bus = rx.bus();

  before(async () => {
    await TestSample.ensureBundle();
  });

  describe('Events', () => {
    const is = Bundle.Events.is;

    it('is (static/instance)', () => {
      const events = Bundle.Events({ bus });
      expect(events.is).to.equal(Bundle.Events.is);
    });

    it('is.base', () => {
      const test = (type: string, expected: boolean) => {
        expect(is.base({ type, payload: {} })).to.eql(expected);
      };

      test('foo', false);
      test('runtime.electron/Bundle', false);

      test('runtime.electron/Bundle/', true);
      test('runtime.electron/Bundle/status:req', true);
    });
  });

  describe('Controller', () => {
    const manifestFilepath = `${Paths.bundle.sys.source}/index.json`;

    describe('list', () => {
      it('list: empty (nothing installed)', async () => {
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const res = await mock.events.bundle.list.get();
        await mock.dispose();

        expect(res.items).to.eql([]);
        expect(res.error).to.eql(undefined);
      });

      it('list: empty ("domain" does not exist)', async () => {
        const mock = await Mock.controllers();
        await mock.events.bundle.install.fire(manifestFilepath); // NB: Install a module, but not the domain we are looking for.

        const res = await mock.events.bundle.list.get({ domain: '404' });
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.items).to.eql([]);
      });

      it('list: item', async () => {
        const mock = await Mock.controllers();
        await mock.events.bundle.install.fire(manifestFilepath); // NB: Install a module, but not the domain we are looking for.

        const res1 = await mock.events.bundle.list.get();
        const res2 = await mock.events.bundle.list.get({ domain: '  local:package  ' });
        await mock.dispose();

        expect(res1.error).to.eql(undefined);
        expect(res2.error).to.eql(undefined);

        expect(res1.items).to.eql(res2.items);
        expect(res1.items.length).to.eql(1);
        expect(res1.items[0].domain).to.eql('local:package');
        expect(res1.items[0].namespace).to.eql('sys.ui.runtime');
      });
    });

    describe('install', () => {
      it('"local:package" (filepath)', async () => {
        const manifest = (await fs.readJson(manifestFilepath)) as t.ModuleManifest;
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const res = await mock.events.bundle.install.fire(manifestFilepath);
        const list = (await mock.events.bundle.list.get()).items;

        expect(res.source).to.eql(manifestFilepath);
        expect(res.action).to.eql('created');
        expect(res.errors).to.eql([]);

        expect(list.length).to.eql(1);
        expect(list[0].domain).to.eql('local:package');
        expect(list[0].namespace).to.eql(manifest.module.namespace);
        expect(list[0].version).to.eql(manifest.module.version);
        expect(list[0].hash).to.eql(manifest.hash.module);
        expect(list[0].fs).to.match(/^cell\:[\d\w]*\:A1$/);

        expect(list[0]).to.eql(res.module);

        // Copied locally by default (domain: "local:package").
        const file = mock.http.cell(res.module?.fs || '').fs.file(`lib/index.json`);
        expect(await file.exists()).to.eql(true);

        await mock.dispose();
      });

      it.skip('install: url (not copied locally)', async () => {
        //

        const mock = await Mock.controllers();
        const source = Paths.bundle.sys.source;
        const dir = `test/dir.${slug()}`;

        // const upload = await mock.events.bundle.upload.fire({
        //   source,
        //   target: { dir },
        //   silent: true,
        // });

        await mock.dispose();

        // console.log('target', target);
        // mock.
        // console.log('upload', upload);
      });

      it('action: "create" => "unchanged" => "replaced"', async () => {
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const install = mock.events.bundle.install;
        const res1 = await install.fire(manifestFilepath);
        const res2 = await install.fire(manifestFilepath);
        const res3 = await install.fire(manifestFilepath, { force: true });
        await mock.dispose();

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('unchanged');
        expect(res3.action).to.eql('replaced');
      });
    });

    describe('fs.save: upload (filepath)', () => {
      it('upload: "created"', async () => {
        const mock = await Mock.controllers();
        const source = Paths.bundle.sys.source;
        const target = { dir: `test/dir.${slug()}`, cell: Uri.create.A1() };
        const paths = await fs.glob.find(`${source}/**`);

        const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
        expect(await file.exists()).to.eql(false); // NB: Not on server yet.

        const silent = true;
        const upload = await mock.events.bundle.fs.save.fire({ source, target, silent });

        expect(upload.ok).to.eql(true);
        expect(upload.cell).to.eql(target.cell);
        expect(upload.files.length).to.eql(paths.length);
        expect(upload.action).to.eql('created');
        expect(upload.elapsed).to.greaterThan(0);
        expect(upload.errors).to.eql([]);

        expect(await file.exists()).to.eql(true); // NB: Uploaded to server.

        await mock.dispose();
      });

      it('upload: existing ("unchanged" => force)', async () => {
        const mock = await Mock.controllers();
        const source = Paths.bundle.sys.source;
        const target = { dir: `test/dir.${slug()}`, cell: Uri.create.A1() };

        const silent = true;
        const res1 = await mock.events.bundle.fs.save.fire({ source, target, silent });
        const res2 = await mock.events.bundle.fs.save.fire({ source, target, silent });
        const res3 = await mock.events.bundle.fs.save.fire({ source, target, force: true, silent });

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('unchanged');
        expect(res3.action).to.eql('replaced');

        const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
        expect(await file.exists()).to.eql(true); // NB: Uploaded to server.

        await mock.dispose();
      });
    });
  });
});
