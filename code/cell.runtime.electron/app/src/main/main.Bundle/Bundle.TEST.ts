import { Bundle } from '.';
import { expect, fs, Mock, Paths, rx, slug, t, TestSample, Uri, Urls } from '../../test';
import { ManifestFetch } from './common';

describe('main.Bundle', function () {
  this.timeout(30000);
  const bus = rx.bus();

  before(async () => {
    await TestSample.ensureBundle();
  });

  async function sampleUpload(options: { source?: string; dir?: string; cell?: string } = {}) {
    const mock = await Mock.controllers();
    const source = options.source ?? fs.join(Paths.bundle.sys.source, 'index.json');
    const target = {
      dir: options.dir ?? `test/dir.${slug()}`,
      cell: options.cell ?? Uri.create.A1(),
    };
    const { http, dispose } = mock;
    const events = mock.events.bundle;

    const fireUpload = async (options: { silent?: boolean; force?: boolean } = {}) => {
      const { silent = true, force = false } = options;
      return events.fs.save.fire({ source, target, silent, force });
    };

    return { source, events, target, http, fireUpload, dispose };
  }

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
    const manifestPath = `${Paths.bundle.sys.source}/index.json`;

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
        await mock.events.bundle.install.fire(manifestPath); // NB: Install a module, but not the domain we are looking for.

        const res = await mock.events.bundle.list.get({ domain: '404' });
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.items).to.eql([]);
      });

      it('list: item', async () => {
        const mock = await Mock.controllers();
        await mock.events.bundle.install.fire(manifestPath); // NB: Install a module, but not the domain we are looking for.

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
        const manifest = (await fs.readJson(manifestPath)) as t.ModuleManifest;
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const res = await mock.events.bundle.install.fire(manifestPath);
        const list = (await mock.events.bundle.list.get()).items;

        expect(res.source).to.eql(manifestPath);
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

      it('install: url', async () => {
        const manifest = (await fs.readJson(manifestPath)) as t.ModuleManifest;
        const mock = await sampleUpload();

        // Upload a sample source bundle.
        await Mock.Registry.clear(mock.http);
        await mock.fireUpload();

        // Prepare the uploaded sample bundle as the source to install from.
        const filepath = `${mock.target.dir}/index.json`;
        const urls = Urls.create(mock.http.origin);
        const source = urls.cell(mock.target.cell).file.byName(filepath).toString();

        // Run the installer event.
        const res = await mock.events.install.fire(source);
        const list = (await mock.events.list.get()).items;

        expect(list.length).to.eql(1);
        expect(list[0].domain).to.eql(new URL(mock.http.origin).host);
        expect(list[0].namespace).to.eql(manifest.module.namespace);
        expect(list[0].version).to.eql(manifest.module.version);
        expect(list[0].hash).to.eql(manifest.hash.module);
        expect(list[0].fs).to.match(/^cell\:[\d\w]*\:A1$/);
        expect(list[0]).to.eql(res.module);

        const file = mock.http.cell(res.module?.fs || '').fs.file(`lib/index.json`);
        expect(await file.exists()).to.eql(true);

        await mock.dispose();
      });

      it('action: "create" => "unchanged" => "replaced"', async () => {
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const install = mock.events.bundle.install;
        const res1 = await install.fire(manifestPath);
        const res2 = await install.fire(manifestPath);
        const res3 = await install.fire(manifestPath, { force: true });
        await mock.dispose();

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('unchanged');
        expect(res3.action).to.eql('replaced');
      });
    });

    describe('fs.save: upload', () => {
      it('upload (filepath): "created"', async () => {
        const mock = await sampleUpload();
        const { target, source, events } = mock;
        const paths = await fs.glob.find(`${fs.dirname(source)}/**`);

        const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
        expect(await file.exists()).to.eql(false); // NB: File not on server yet.

        const silent = true;
        const res = await events.fs.save.fire({ source, target, silent });

        expect(res.ok).to.eql(true);
        expect(res.cell).to.eql(target.cell);
        expect(res.files.length).to.eql(paths.length);
        expect(res.action).to.eql('created');
        expect(res.elapsed).to.greaterThan(0);
        expect(res.errors).to.eql([]);

        expect(await file.exists()).to.eql(true); // NB: File uploaded to server.
        await mock.dispose();
      });

      it('upload (filepath): existing ("unchanged" => force)', async () => {
        const mock = await sampleUpload();
        const { target, source, events } = mock;

        const silent = true;
        const res1 = await events.fs.save.fire({ source, target, silent });
        const res2 = await events.fs.save.fire({ source, target, silent });
        const res3 = await events.fs.save.fire({ source, target, force: true, silent });

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('unchanged');
        expect(res3.action).to.eql('replaced');

        const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
        expect(await file.exists()).to.eql(true); // NB: Uploaded to server.

        await mock.dispose();
      });

      it('upload: trims target dir path ("/")', async () => {
        const mock = await sampleUpload({ dir: '///foo/bar///' });
        const res = await mock.fireUpload();
        await mock.dispose();
        expect(res.files.every((file) => file.path.startsWith('foo/bar/'))).to.eql(true);
      });

      it('upload (url)', async () => {
        const mock = await sampleUpload();

        // Upload a bundle to use as the source.
        await mock.fireUpload();
        const filepath = `${mock.target.dir}/index.json`;
        const urls = Urls.create(mock.http.origin);
        const source = urls.cell(mock.target.cell).file.byName(filepath).toString();

        const target = {
          dir: `foo`,
          cell: Uri.create.A1(),
        };

        const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
        expect(await file.exists()).to.eql(false); // NB: File not on server yet.

        const res = await mock.events.fs.save.fire({ source, target, silent: true });

        expect(res.ok).to.eql(true);
        expect(res.cell).to.eql(target.cell);
        expect(res.action).to.eql('created');
        expect(res.elapsed).to.greaterThan(0);
        expect(res.errors).to.eql([]);

        expect(await file.exists()).to.eql(true); // NB: File uploaded to server.
        await mock.dispose();
      });
    });
  });
});
