import { expect, Mock, Uri, expectError, IMockServer, TestSample, time } from '../../test';
import { ModuleRegistry, ManifestSource } from '.';
import { Encoding } from './util';
import { d } from './common';

describe.only('ModuleRegistry (Http Client)', () => {
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

  describe('Encoding', () => {
    describe('domain key', () => {
      it('encode => decode', () => {
        const test = (input: string, expected: string) => {
          const encoded = Encoding.domainKey.escape(input);
          expect(encoded).to.eql(expected, 'escape');
          expect(Encoding.domainKey.unescape(encoded)).to.eql(input.trim(), 'unescape');
        };
        test('  localhost  ', 'domain.localhost');
        test('localhost:8080', 'domain.localhost[.]8080');
        test('local:package', 'domain.local[.]package');
        test('foo.bar:package', 'domain.foo.bar[.]package');
      });

      it('is (flag)', () => {
        const test = (input: string, expected: boolean) => {
          expect(Encoding.domainKey.is(input)).to.eql(expected);
        };
        test('  domain.localhost  ', true);
        test('domain.localhost[.]8080', true);
        test('  localhost  ', false);
        test('', false);
      });
    });

    describe('namespace key', () => {
      it('encode => decode', () => {
        const test = (input: string, expected: string) => {
          const encoded = Encoding.namespaceKey.escape(input);
          expect(encoded).to.eql(expected, 'escape');
          expect(Encoding.namespaceKey.unescape(encoded)).to.eql(input.trim(), 'unescape');
        };
        test('  localhost  ', 'ns.localhost');
        test('localhost:8080', 'ns.localhost[.]8080');
        test('local:package', 'ns.local[.]package');
        test('foo.bar:package', 'ns.foo.bar[.]package');
      });

      it('is (flag)', () => {
        const test = (input: string, expected: boolean) => {
          expect(Encoding.namespaceKey.is(input)).to.eql(expected);
        };
        test('  ns.localhost  ', true);
        test('ns.localhost[.]8080', true);
        test('  localhost  ', false);
        test('', false);
      });
    });
  });

  describe('ModuleRegistry', () => {
    it('create', async () => {
      const uri = Uri.create.A1();
      const { registry } = await mockRegistry({ uri });
      expect(registry.uri.toString()).to.eql(uri);
    });

    it('list: domains (empty)', async () => {
      const { registry } = await mockRegistry();
      const res = await registry.domains();
      expect(res).to.eql([]);
    });

    it('list: domains', async () => {
      const { registry } = await mockRegistry();

      const domain1 = registry.domain('  domain.com:1234  ');
      const domain2 = registry.domain('  local:package  ');
      expect(await registry.domains()).to.eql([]); // NB: Nothing written to DB yet.

      const ns1 = await domain1.namespace('foo.bar');
      const ns2 = await domain2.namespace('foo.bar');

      const res = await registry.domains();

      expect(res[0]).to.eql('domain.com:1234');
      expect(res[1]).to.eql('local:package');

      expect(res[0]).to.eql(ns1.domain);
      expect(res[1]).to.eql(ns2.domain);
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

      const link = links.cells.find((link) => {
        const key = Encoding.domainKey.unescape(link.key);
        return key === 'localhost:1234';
      });

      expect(link?.value).to.eql(res1.toString());
    });

    it('list: namespaces (empty)', async () => {
      const { registry } = await mockRegistry();
      const domain = registry.domain('localhost:1234');
      expect(await domain.namespaces()).to.eql([]);
    });

    it('list: namespaces', async () => {
      const { registry } = await mockRegistry();
      const domain = registry.domain('localhost:1234');

      const ns1 = await domain.namespace('ns.a');
      const ns2 = await domain.namespace('ns.a'); // NB: repeat (does not duplicate).
      const ns3 = await domain.namespace('ns.b');

      const res = await domain.namespaces();

      expect(res.length).to.eql(2);
      expect(res[0]).to.eql('ns.a');
      expect(res[1]).to.eql('ns.b');

      expect(res[0]).to.eql(ns1.namespace);
      expect(res[1]).to.eql(ns3.namespace);
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

        const fn = () => ns.write({ source: '/dir/index.json', manifest });
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

        const res = await ns.write({ source, manifest });
        const v1 = await ns.read(version);
        expect(res.action).to.eql('created');

        const versions = await ns.versions();
        expect(versions.length).to.eql(1);

        const entry = versions[0];
        expect(res.entry).to.eql(entry);
        expect(entry.version).to.eql(version);
        expect(entry.fs.startsWith('cell:')).to.eql(true);
        expect(entry.hash.startsWith('sha256-')).to.eql(true);
        expect(entry.source).to.eql(source);

        await time.wait(10);

        const v2 = await ns.read(version);
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

        await ns.write({ source, manifest: manifest1 });
        expect((await ns.read(version))?.hash).to.eql(manifest1.hash.module);
        const v1 = await ns.read(version);

        await time.wait(10);

        const change = 'sha256-changed';
        manifest2.hash.module = change;
        const res = await ns.write({ source, manifest: manifest2 });
        expect(res.action).to.eql('updated');

        const v2 = await ns.read(version);
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

        expect(ManifestSource(filepath).kind).to.eql('filepath');
        expect(ManifestSource(url).kind).to.eql('url');

        const res1 = await ns.write({ source: filepath, manifest });
        const res2 = await ns.write({
          source: url,
          manifest,
        });

        expect(res1.entry.source).to.eql(filepath);
        expect(res2.entry.source).to.eql(url);
      });

      it('throw: invalid manifest source', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('localhost:1234');

        const version = '1.2.3';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);
        const manifest = await TestSample.manifest({ namespace, version });

        const test = async (source: any) => {
          const fn = () => ns.write({ source, manifest });
          await expectError(fn, 'Invalid manifest source');
        };

        await test('');
        await test(' ');
        await test('file/path/index.json'); // NB: does not start with "/".
        await test('/path/index'); // NB: Not a JSON file.

        await test(123);
        await test(true);
        await test({});
        await test([]);
        await test(null);
      });
    });
  });
});
