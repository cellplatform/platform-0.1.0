import { Bundle } from '.';
import { toHost, expect, fs, Mock, Paths, rx, slug, t, TestSample, Uri, Urls } from '../../test';

describe('main.Bundle', function () {
  this.timeout(30000);
  const bus = rx.bus();

  before(async () => {
    await TestSample.ensureBundle();
  });

  async function SampleUploadMock(options: { source?: string; dir?: string; cell?: string } = {}) {
    const mock = await Mock.controllers();
    const source = options.source ?? Paths.bundle.sys.source.manifest;
    const target = {
      dir: options.dir ?? `test/dir.${slug()}`,
      cell: options.cell ?? Uri.create.A1(),
    };
    const { http, paths, dispose } = mock;
    const events = mock.events.bundle;
    const urls = Urls.create(http.origin);

    const upload = async (options: { silent?: boolean; force?: boolean } = {}) => {
      const { silent = true, force = false } = options;
      return events.fs.save.fire({ source, target, silent, force });
    };

    return { source, events, target, urls, http, paths, upload, dispose };
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
    const manifestPath = Paths.bundle.sys.source.manifest;

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
        await mock.events.bundle.install.fire(manifestPath, { silent: true }); // NB: Install a module, but not the domain we are looking for.

        const res = await mock.events.bundle.list.get({ domain: '404' });
        await mock.dispose();

        expect(res.error).to.eql(undefined);
        expect(res.items).to.eql([]);
      });

      it('list: item', async () => {
        const mock = await Mock.controllers();
        await mock.events.bundle.install.fire(manifestPath, { silent: true }); // NB: Install a module, but not the domain we are looking for.

        const res1 = await mock.events.bundle.list.get();
        const res2 = await mock.events.bundle.list.get({ domain: '  runtime:electron:bundle  ' });
        await mock.dispose();

        expect(res1.error).to.eql(undefined);
        expect(res2.error).to.eql(undefined);

        expect(res1.items).to.eql(res2.items);
        expect(res1.items.length).to.eql(1);
        expect(res1.items[0].domain).to.eql('runtime:electron:bundle');
        expect(res1.items[0].namespace).to.eql('sys.ui.runtime');
      });
    });

    describe('install', () => {
      it('"runtime:electron:bundle" (filepath)', async () => {
        const manifest = (await fs.readJson(manifestPath)) as t.ModuleManifest;
        const mock = await Mock.controllers();
        await Mock.Registry.clear(mock.http);

        const res = await mock.events.bundle.install.fire(manifestPath, { silent: true });
        const list = (await mock.events.bundle.list.get()).items;

        expect(res.source).to.eql(manifestPath);
        expect(res.action).to.eql('created');
        expect(res.errors).to.eql([]);

        expect(list.length).to.eql(1);
        expect(list[0].domain).to.eql('runtime:electron:bundle');
        expect(list[0].namespace).to.eql(manifest.module.namespace);
        expect(list[0].version).to.eql(manifest.module.version);
        expect(list[0].hash).to.eql(manifest.hash.module);
        expect(list[0].fs).to.match(/^cell\:[\d\w]*\:A1$/);
        expect(list[0]).to.eql(res.module);

        // Copied locally by default (domain: "runtime:electron:bundle").
        const file = mock.http.cell(res.module?.fs || '').fs.file(`lib/index.json`);
        expect(await file.exists()).to.eql(true);

        await mock.dispose();
      });

      it('install: url', async () => {
        const manifest = (await fs.readJson(manifestPath)) as t.ModuleManifest;
        const mock = await SampleUploadMock();

        // Upload a sample source bundle.
        await Mock.Registry.clear(mock.http);
        await mock.upload();

        // Prepare the uploaded sample bundle as the source to install from.
        const filepath = `${mock.target.dir}/index.json`;
        const urls = Urls.create(mock.http.origin);
        const source = urls.cell(mock.target.cell).file.byName(filepath).toString();

        // Run the installer event.

        const res = await mock.events.install.fire(source, { silent: true });
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
        const res1 = await install.fire(manifestPath, { silent: true });
        const res2 = await install.fire(manifestPath, { silent: true });
        const res3 = await install.fire(manifestPath, { force: true, silent: true });
        await mock.dispose();

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('unchanged');
        expect(res3.action).to.eql('replaced');
      });
    });

    describe('status', () => {
      it('exists: true', async () => {
        const mock = await Mock.controllers();
        await mock.events.bundle.install.fire(manifestPath, { silent: true }); // NB: Install a module, but not the domain we are looking for.

        const res = await mock.events.bundle.status.get({
          domain: 'runtime:electron:bundle',
          namespace: 'sys.ui.runtime',
        });

        await mock.dispose();
        const status = res.status;

        expect(res.exists).to.eql(true);
        expect(res.error).to.eql(undefined);

        expect(status?.latest).to.eql(true);
        expect(status?.compiler).to.match(/^@platform\/cell\.compiler\@/);

        expect(status?.module.hash).to.match(/^sha256-/);
        expect(status?.module.domain).to.eql('runtime:electron:bundle');
        expect(status?.module.namespace).to.eql('sys.ui.runtime');
        expect(status?.module.version).to.match(/^\d+\.\d+\.\d+$/);
        expect(status?.module.fs).to.match(/cell\:[\d\w]+\:[A-Z]+[1-9]+$/);
      });

      it('exists: false', async () => {
        const mock = await Mock.controllers();
        const res = await mock.events.bundle.status.get({
          domain: 'runtime:electron:bundle',
          namespace: 'foo.bar.404',
        });
        await mock.dispose();

        expect(res.exists).to.eql(false);
        expect(res.error).to.eql(undefined);
        expect(res.status).to.eql(undefined);
      });
    });

    describe.only('fs.save (upload)', () => {
      it('trims target dir path ("/")', async () => {
        const mock = await SampleUploadMock({ dir: '///foo/bar///' });
        const res = await mock.upload();
        await mock.dispose();
        expect(res.files.every((file) => file.path.startsWith('foo/bar/'))).to.eql(true);
      });

      describe('source.fs(local) => target.http', () => {
        it('fs(local) => http (action: "created")', async () => {
          const mock = await SampleUploadMock();
          const { target, source, events } = mock;
          const paths = await fs.glob.find(`${fs.dirname(source)}/**`);

          const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await file.exists()).to.eql(false); // NB: File not on server yet.

          const res = await events.fs.save.fire({ source, target, silent: true });

          expect(res.ok).to.eql(true);
          expect(res.errors).to.eql([]);
          expect(res.source).to.eql(source);
          expect(res.target.cell).to.eql(target.cell);
          expect(res.target.host).to.eql(new URL(mock.http.origin).host);
          expect(res.files.length).to.eql(paths.length);
          expect(res.files.every((file) => file.path.startsWith(target.dir))).to.eql(true);
          expect(res.action).to.eql('created');
          expect(res.elapsed).to.greaterThan(0);

          expect(await file.exists()).to.eql(true); // NB: File uploaded to server.
          await mock.dispose();
        });

        it('fs(local) => http (existing: "unchanged" => force)', async () => {
          const mock = await SampleUploadMock();
          const { target, source, events } = mock;

          const res1 = await events.fs.save.fire({ source, target, silent: true });
          const res2 = await events.fs.save.fire({ source, target, silent: true });
          const res3 = await events.fs.save.fire({ source, target, force: true, silent: true });

          expect(res1.action).to.eql('created');
          expect(res2.action).to.eql('unchanged');
          expect(res3.action).to.eql('replaced');

          const file = mock.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await file.exists()).to.eql(true); // NB: Uploaded to server.

          await mock.dispose();
        });
      });

      describe('source.http => target.http', () => {
        it('local  => local  (same server)', async () => {
          // Upload a bundle to use as the local HTTP source.
          const sample = await SampleUploadMock();
          await sample.upload();

          const target = {
            dir: `foo`,
            cell: Uri.create.A1(),
          };

          const file = sample.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await file.exists()).to.eql(false); // NB: File not on server yet.

          // Upload to another cell on the same server.
          const filepath = `${sample.target.dir}/index.json`;
          const source = sample.urls.cell(sample.target.cell).file.byName(filepath).toString();
          const res = await sample.events.fs.save.fire({ source, target, silent: true });

          expect(res.ok).to.eql(true);
          expect(res.errors).to.eql([]);
          expect(res.source).to.eql(source);
          expect(res.target.cell).to.eql(target.cell);
          expect(res.target.host).to.eql(new URL(sample.http.origin).host);
          expect(res.action).to.eql('created');

          expect(await file.exists()).to.eql(true); // NB: File uploaded to server.
          await sample.dispose();
        });

        it('local  => remote (different server)', async () => {
          const local = await SampleUploadMock();
          const remote = await Mock.server();

          // Upload a bundle to use as the local HTTP source.
          await local.upload();
          const localFile = local.http
            .cell(local.target.cell)
            .fs.file(`${local.target.dir}/index.json`);
          expect(await localFile.exists()).to.eql(true, 'local file exists');

          const target = {
            host: remote.host,
            dir: `foo/1.2.3`,
            cell: Uri.create.A1(),
          };
          const remoteFile = remote.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await remoteFile.exists()).to.eql(false); // NB: File not on server yet.

          // Save to the different ("remote") server.
          const source = local.urls.cell(local.target.cell).file.byName(localFile.path).toString();

          const res1 = await local.events.fs.save.fire({ source, target, silent: true });
          const res2 = await local.events.fs.save.fire({ source, target, silent: true });

          expect(res1.action).to.eql('created');
          expect(res2.action).to.eql('unchanged');

          expect(res1.ok).to.eql(true);
          expect(res1.source).to.eql(source);
          expect(res1.target.host).to.eql(toHost(remote.host));
          expect(res1.target.cell).to.eql(target.cell);
          expect(res1.files.every((file) => file.path.startsWith(target.dir))).to.eql(true);

          // NB: Exists on "remote" server now.
          expect(await remoteFile.exists()).to.eql(true);

          await local.dispose();
          await remote.dispose();
        });

        it('remote => local  (via local copy)', async () => {
          const remote = await SampleUploadMock();
          const local = await Mock.server();

          // Upload a bundle to use as the remote HTTP source.
          await remote.upload();
          const remoteFile = remote.http
            .cell(remote.target.cell)
            .fs.file(`${remote.target.dir}/index.json`);
          expect(await remoteFile.exists()).to.eql(true, 'local file exists');

          const target = {
            host: local.host,
            dir: `foo/1.2.3`,
            cell: Uri.create.A1(),
          };
          const localFile = local.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await localFile.exists()).to.eql(false); // NB: File not on server yet.

          // Save to the different ("local") server.
          const source = remote.urls
            .cell(remote.target.cell)
            .file.byName(remoteFile.path)
            .toString();

          const res1 = await remote.events.fs.save.fire({ source, target, silent: true });
          const res2 = await remote.events.fs.save.fire({ source, target, silent: true });

          expect(res1.action).to.eql('created');
          expect(res2.action).to.eql('unchanged');

          // NB: Exists on "local" server now.
          expect(await localFile.exists()).to.eql(true);

          await local.dispose();
          await remote.dispose();
        });

        it('remote => remote (via local copy)', async () => {
          const remote1 = await SampleUploadMock();
          const remote2 = await SampleUploadMock();

          // Upload a bundle to use as the remote HTTP source.
          await remote1.upload();
          const remoteFile1 = remote1.http
            .cell(remote1.target.cell)
            .fs.file(`${remote1.target.dir}/index.json`);
          expect(await remoteFile1.exists()).to.eql(true, 'local file exists');

          const target = {
            host: toHost(remote2.http.origin),
            dir: `foo/1.2.3`,
            cell: Uri.create.A1(),
          };
          const remoteFile2 = remote2.http.cell(target.cell).fs.file(`${target.dir}/index.json`);
          expect(await remoteFile2.exists()).to.eql(false); // NB: File not on server yet.

          // Save to the different ("remote") server.
          const source = remote1.urls
            .cell(remote1.target.cell)
            .file.byName(remoteFile1.path)
            .toString();

          const res1 = await remote1.events.fs.save.fire({ source, target, silent: true });
          const res2 = await remote1.events.fs.save.fire({ source, target, silent: true });

          expect(res1.action).to.eql('created');
          expect(res2.action).to.eql('unchanged');

          // NB: Exists on "local" server now.
          expect(await remoteFile2.exists()).to.eql(true);

          await remote2.dispose();
          await remote1.dispose();
        });
      });

      describe.skip('source.http => target.fs(local)', () => {
        it('http(local) => fs(local)', async () => {
          const local = await SampleUploadMock();

          // Upload a bundle to use as the local HTTP source.
          await local.upload();
          const localFile = local.http
            .cell(local.target.cell)
            .fs.file(`${local.target.dir}/index.json`);
          expect(await localFile.exists()).to.eql(true, 'local file exists');

          const tmp = fs.join(Paths.tmp, `save.${slug()}`);
          console.log('tmp', tmp);

          await local.dispose();
        });
      });
    });
  });
});
