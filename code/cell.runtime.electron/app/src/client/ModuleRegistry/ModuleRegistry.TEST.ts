import { expect, Mock, Uri, expectError, IMockServer, TestSample, time } from '../../test';
import { ModuleRegistry } from '.';
import { d } from './common';

describe.only('client: ModuleRegistry', () => {
  let server: IMockServer;

  before(async () => (server = await Mock.server()));
  after(async () => {
    await server?.dispose();
    await Mock.delete();
  });

  const mockRegistry = async (options: { uri?: string } = {}) => {
    const { http } = server;
    const uri = options.uri || Uri.create.A1();
    const registry = ModuleRegistry({ http, uri });
    return { http, registry };
  };

  describe('ModuleRegistry', () => {
    it('create', async () => {
      const uri = Uri.create.A1();
      const { registry } = await mockRegistry({ uri });
      expect(registry.uri.toString()).to.eql(uri);
    });
  });

  describe('ModuleRegistryDomain', () => {
    it('create', async () => {
      const { registry } = await mockRegistry();

      const test = (input: string, expected: string) => {
        const res = registry.domain(input);
        expect(res.domain).to.eql(expected);
        expect(res.toString()).to.eql(`[ModuleRegistryDomain:${expected}]`);
      };

      test('localhost', 'localhost');
      test('localhost:1234', 'localhost:1234');
      test('  localhost:1234  ', 'localhost:1234');

      test('  domain.com  ', 'domain.com');
      test('  http://localhost:1234  ', 'localhost:1234');
      test('  https://domain.com  ', 'domain.com');
      test('  https://domain.com:80  ', 'domain.com');
      test('  https://domain.com:1234  ', 'domain.com:1234');
    });

    it('writes cell meta-data on creation', async () => {
      const { registry, http } = await mockRegistry();

      const domain = registry.domain('  https://domain.com  ');
      expect(domain.toString()).to.eql('[ModuleRegistryDomain:domain.com]');

      const cell = http.cell(await domain.uri());
      const props = (await cell.info()).body.data.props as d.RegistryCellPropsDomain;

      expect(props?.title).to.eql('Module Registry (Domain)');
      expect(props?.domain).to.eql('domain.com'); // NB: cleaned.
    });

    it('domain "local:package"', async () => {
      const { registry, http } = await mockRegistry();
      const domain = registry.domain('  local:package  ');

      const cell = http.cell(await domain.uri());
      const props = (await cell.info()).body.data.props as d.RegistryCellPropsDomain;

      expect(props.domain).to.eql('local:package');
      expect(domain.domain).to.eql('local:package');
      expect(domain.toString()).to.eql('[ModuleRegistryDomain:local:package]');
    });

    it('throw: invalid domain', async () => {
      const { registry } = await mockRegistry();
      const test = (input: any) => {
        const fn = () => registry.domain(input);
        expect(fn).to.throw(/Invalid domain/);
      };
      test('');
      test('  ');
      test('1234'); // minimum length 5 characters.
      test('foo/bar'); // no path character ("/").
      test('foobar:');
      test(':foobar');
      test(123);
      test(true);
      test({});
      test([]);
      test(null);
    });

    it('uri', async () => {
      const { registry, http } = await mockRegistry();
      const domain = registry.domain('localhost:1234');

      const res1 = await domain.uri();
      const res2 = await domain.uri();
      expect(res1.toString()).to.eql(res2.toString());

      const links = (await http.cell(registry.uri).links.read()).body;
      const link = links.cells.find((link) => link.key === 'localhost.1234');
      expect(link?.value).to.eql(res1.toString());
    });
  });

  describe('ModuleRegistryNamespace', () => {
    it('create', async () => {
      const { registry } = await mockRegistry();
      const domain = registry.domain('  localhost:1234  ');
      const ns = await domain.namespace('  foo.bar  ');

      expect(ns.namespace).to.eql('foo.bar');
      expect(ns.domain).to.eql('localhost:1234');
    });

    it('writes cell meta-data on creation', async () => {
      const { registry, http } = await mockRegistry();
      const domain = registry.domain('localhost');
      const ns = await domain.namespace('  foo.bar  ');

      const cell = http.cell(ns.uri);
      const props = (await cell.info()).body.data.props as d.RegistryCellPropsNamespace;

      expect(props.title).to.eql('Module Registry (Namespace)');
      expect(props.namespace).to.eql('foo.bar'); // NB: cleaned.
    });

    it('throw: invalid namespace', async () => {
      const { registry } = await mockRegistry();
      const domain = registry.domain('localhost:1234');

      const test = async (input: any) => {
        const fn = () => domain.namespace(input);
        await expectError(fn, 'Invalid namespace');
      };

      await test('');
      await test('  ');
      await test('foo/bar');
      await test('!foo');
      await test('foo-bar');
      await test('foo bar');
      await test(123);
      await test(true);
      await test({});
      await test([]);
      await test(null);
    });

    describe('put', () => {
      it('throw - namespace mismatch', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('local:package');
        const ns = await domain.namespace('ns.foo');
        const manifest = await TestSample.manifest({ namespace: 'ns.bar' });

        const fn = () => ns.put({ source: '/dir/index.json', manifest });
        await expectError(fn, 'Namespace mismatch');
      });

      it('create version entry', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('local:package');

        const source = '/dir/index.json';
        const version = '1.2.3';
        const namespace = 'foo.bar';
        const manifest = await TestSample.manifest({ namespace, version });
        const ns = await domain.namespace(namespace);

        expect(await ns.versions()).to.eql([]);

        const res = await ns.put({ source, manifest });
        const v1 = await ns.get(version);
        expect(res.action).to.eql('created');

        const versions = await ns.versions();
        expect(versions.length).to.eql(1);

        const entry = versions[0];
        expect(res.entry).to.eql(entry);
        expect(entry.version).to.eql(version);
        expect(entry.fs.startsWith('cell:')).to.eql(true);
        expect(entry.hash.startsWith('sha256-')).to.eql(true);
        expect(entry.source.manifest).to.eql(source);
        expect(entry.source.kind).to.eql('filepath');

        await time.wait(10);

        const v2 = await ns.get(version);
        expect(v2?.modifiedAt).to.eql(v1?.modifiedAt); // NB: no change.
      });

      it('update existing version entry', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('local:package');

        const source = '/dir/index.json';
        const version = '1.2.3';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);

        const manifest1 = await TestSample.manifest({ namespace, version });
        const manifest2 = await TestSample.manifest({ namespace, version });

        await ns.put({ source, manifest: manifest1 });
        expect((await ns.get(version))?.hash).to.eql(manifest1.hash.module);
        const v1 = await ns.get(version);

        await time.wait(10);

        const change = 'sha256-changed';
        manifest2.hash.module = change;
        const res = await ns.put({ source, manifest: manifest2 });
        expect(res.action).to.eql('updated');

        const v2 = await ns.get(version);
        expect(v2?.hash).to.eql(change);
        expect(v2).to.eql(res.entry);

        expect(v2?.modifiedAt).to.greaterThan(v1?.modifiedAt ?? -1);
      });

      it('manifest source: url | filepath', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('localhost:1234');
        const namespace = 'foo.bar';
        const manifest = await TestSample.manifest({ namespace });
        const ns = await domain.namespace(namespace);

        const filepath = '/dir/index.json';
        const url = 'https://domain.com/cell:foo:A1/fs/dir/index.json';

        const res1 = await ns.put({ source: filepath, manifest });
        const res2 = await ns.put({
          source: url,
          manifest,
        });

        expect(res1.entry.source.kind).to.eql('filepath');
        expect(res2.entry.source.kind).to.eql('url');

        expect(res1.entry.source.manifest).to.eql(filepath);
        expect(res2.entry.source.manifest).to.eql(url);
      });

      it('throw: invalid manifest source', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('localhost:1234');

        const version = '1.2.3';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);
        const manifest = await TestSample.manifest({ namespace, version });

        const test = async (source: any) => {
          const fn = () => ns.put({ source, manifest });
          await expectError(fn, 'Invalid manifest source');
        };

        await test('');
        await test(' ');
        await test('file/path'); // NB: does not start with "/".

        await test(123);
        await test(true);
        await test({});
        await test([]);
        await test(null);
      });
    });
  });
});
