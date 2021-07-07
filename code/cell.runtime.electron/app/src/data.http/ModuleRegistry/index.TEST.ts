import { ModuleRegistry } from '.';
import { expect, expectError, IMockServer, Mock, TestSample, time, Uri } from '../../test';

import { t, Encoding } from './common';

describe('data.http: ModuleRegistry', () => {
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

  const uploadSampleFile = async (http: t.IHttpClient, uri: string, filename?: string) => {
    filename = filename ?? 'test.txt';
    const data = new Uint8Array([1, 2, 3, 4]).buffer;
    const fs = http.cell(uri).fs;
    await fs.upload({ filename, data });
    return { fs, filename, data };
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
        test('domain.foo', 'domain.domain.foo');
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
        test('ns.a', 'ns.ns.a');
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

    it('delete', async () => {
      const { registry } = await mockRegistry();

      const domain1 = registry.domain('domain.com');
      const domain2 = registry.domain('local:package');
      await domain1.namespace('foo.bar');
      await domain2.namespace('foo.bar');

      expect(await registry.domains()).to.eql(['domain.com', 'local:package']);

      await registry.delete();
      expect(await registry.domains()).to.eql([]);
    });
  });

  describe('ModuleRegistryDomain', () => {
    it('create', async () => {
      const { registry } = await mockRegistry();

      const test = (input: string, expectedName: string) => {
        const domain = registry.domain(input);
        expect(domain.name).to.eql(expectedName);
        expect(domain.toString()).to.eql(`[ModuleRegistryDomain:${expectedName}]`);
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
      const props = (await cell.info()).body.data.props as t.RegistryCellPropsDomain;

      expect(props?.title).to.eql('Module Registry (Domain)');
      expect(props?.domain).to.eql('domain.com'); // NB: cleaned.
    });

    it('domain "local:package"', async () => {
      const { registry, http } = await mockRegistry();
      const domain = registry.domain('  local:package  ');

      const cell = http.cell(await domain.uri());
      const props = (await cell.info()).body.data.props as t.RegistryCellPropsDomain;

      expect(props.domain).to.eql('local:package');
      expect(domain.name).to.eql('local:package');
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

      expect(res[0]).to.eql(ns1.name);
      expect(res[1]).to.eql(ns3.name);
    });

    it('delete', async () => {
      type P = t.RegistryCellPropsNamespace;

      const { registry, http } = await mockRegistry();
      const domain = registry.domain('localhost:1234');
      const cell = http.cell(await domain.uri());
      const getDomainInfo = async () => (await cell.info()).body.data;

      await domain.namespace('ns.a');
      await domain.namespace('ns.b');
      await domain.namespace('ns.c');

      const source = '/dir/index.json';
      const version = '1.2.3';
      const manifest = await TestSample.manifest({ namespace: 'ns.a', version });
      const ns = await domain.namespace('ns.a');
      const { entry } = await ns.write({ source, manifest });

      const filename = 'lib/test.txt';
      const { fs } = await uploadSampleFile(http, entry.fs, filename);

      expect(await fs.file(filename).exists()).to.eql(true);
      expect(await domain.namespaces()).to.eql(['ns.a', 'ns.b', 'ns.c']);

      // NB: Namespaces linked.
      const info1 = await getDomainInfo();
      const links1 = info1.links || {};
      for (const key of Object.keys(links1)) {
        const uri = links1[key];
        const props = (await http.cell(uri).db.props.read<P>()).body;
        expect(props?.kind).to.eql('registry:namespace');
      }

      await domain.delete('  ns.a  ');
      const info2 = await getDomainInfo();
      const links2 = info2.links || {};

      // NB: namespace "ns.a" removed, others remain.
      for (const key of Object.keys(links1)) {
        const uri = links1[key];
        const props = (await http.cell(uri).db.props.read<P>()).body;
        if (key === 'ref:ns:ns:a') {
          expect(props).to.eql(undefined); // NB: Deleted.
        } else {
          expect(props?.kind).to.eql('registry:namespace'); // NB: Remaining.
        }
      }

      expect(await fs.file(filename).exists()).to.eql(false); // NB: file attached to "ns.a" is deleted.
      expect((info2.props as t.RegistryCellPropsDomain).domain).to.eql('localhost:1234');
      expect(Object.keys(links2)).to.eql(['ref:ns:ns:b', 'ref:ns:ns:c']);

      await domain.delete(); // NB: No param, delete remaining items.
      expect(await getDomainInfo()).to.eql({}); // NB: everything gone.
    });
  });

  describe('ModuleRegistryNamespace', () => {
    it('create', async () => {
      const { registry } = await mockRegistry();
      const domain = registry.domain('  localhost:1234  ');
      const ns = await domain.namespace('  foo.bar  ');

      expect(ns.name).to.eql('foo.bar');
      expect(ns.domain).to.eql('localhost:1234');
    });

    it('writes cell meta-data on creation', async () => {
      const { registry, http } = await mockRegistry();
      const domain = registry.domain('localhost');
      const ns = await domain.namespace('  foo.bar  ');

      const cell = http.cell(ns.uri);
      const props = (await cell.info()).body.data.props as t.RegistryCellPropsNamespace;

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

    describe('read/write', () => {
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

        expect(await ns.read()).to.eql([]);

        const res = await ns.write({ source, manifest });
        const v1 = await ns.version(version);
        expect(res.action).to.eql('created');

        const versions = await ns.read();
        expect(versions.length).to.eql(1);

        const entry = versions[0];
        expect(res.entry).to.eql(entry);
        expect(entry.version).to.eql(version);
        expect(entry.fs.startsWith('cell:')).to.eql(true);
        expect(entry.hash.startsWith('sha256-')).to.eql(true);
        expect(entry.source).to.eql(source);

        await time.wait(10);

        const v2 = await ns.version(version);
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
        expect((await ns.version(version))?.hash).to.eql(manifest1.hash.module);
        const v1 = await ns.version(version);

        await time.wait(10);

        const change = 'sha256-changed';
        manifest2.hash.module = change;
        const res = await ns.write({ source, manifest: manifest2 });
        expect(res.action).to.eql('updated');

        const v2 = await ns.version(version);
        expect(v2?.hash).to.eql(change);
        expect(v2).to.eql(res.entry);

        expect(v2?.modifiedAt).to.greaterThan(v1?.modifiedAt ?? -1);
      });

      it('add later version (lists versions in descending order)', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('local:package');

        const source = '/dir/index.json';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);

        const manifest1 = await TestSample.manifest({ namespace, version: '1.0.0' });
        const manifest2 = await TestSample.manifest({ namespace, version: '1.0.1' });

        const res1 = await ns.write({ source, manifest: manifest1 });
        const res2 = await ns.write({ source, manifest: manifest2 });

        expect(res1.action).to.eql('created');
        expect(res2.action).to.eql('created'); // NB: New version registered as a "create" action.

        const versions = {
          ascending: (await ns.read({ order: 'asc' })).map((item) => item.version),
          descending: (await ns.read()).map((item) => item.version), // Default order: "desc".
        };

        expect(versions.ascending).to.eql(['1.0.0', '1.0.1']);
        expect(versions.descending).to.eql(['1.0.1', '1.0.0']);
      });

      it('latest (version)', async () => {
        const { registry } = await mockRegistry();
        const domain = registry.domain('local:package');

        const source = '/dir/index.json';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);

        const manifest1 = await TestSample.manifest({ namespace, version: '1.0.0' });
        const manifest2 = await TestSample.manifest({ namespace, version: '1.0.1' });

        expect(await ns.latest()).to.eql(undefined);

        await ns.write({ source, manifest: manifest1 });
        expect((await ns.latest()).version).to.eql('1.0.0');

        await ns.write({ source, manifest: manifest2 });
        expect((await ns.latest()).version).to.eql('1.0.1');
      });

      it('delete: version(s)', async () => {
        const { registry, http } = await mockRegistry();
        const domain = registry.domain('local:package');

        const source = '/dir/index.json';
        const namespace = 'foo.bar';
        const ns = await domain.namespace(namespace);

        const ensureVersions = async (versions: string[]) => {
          const res = (await ns.read()).map(({ version }) => version);
          expect(res).to.eql(versions);
        };

        const manifest1 = await TestSample.manifest({ namespace, version: '1.0.0' });
        const manifest2 = await TestSample.manifest({ namespace, version: '1.0.1' });
        const manifest3 = await TestSample.manifest({ namespace, version: '1.2.3' });

        await ensureVersions([]);
        await ns.delete(); // NB: nothing to delete.
        await ensureVersions([]);

        const { entry } = await ns.write({ source, manifest: manifest1 });
        await ns.write({ source, manifest: manifest2 });
        await ns.write({ source, manifest: manifest3 });
        await ensureVersions(['1.2.3', '1.0.1', '1.0.0']);

        // Upload sample file.
        const filename = 'lib/test.txt';
        const { fs } = await uploadSampleFile(http, entry.fs, filename);
        expect(await fs.file(filename).exists()).to.eql(true);

        await ns.delete('5.0.0'); // NB: does not exist - no change.
        await ensureVersions(['1.2.3', '1.0.1', '1.0.0']);

        await ns.delete('  1.0.1  '); // NB: trimmed.
        await ensureVersions(['1.2.3', '1.0.0']);

        await ns.delete();
        await ensureVersions([]); // NB: all remaining versions removed.

        expect(await fs.file(filename).exists()).to.eql(false); // Uploaded file does not exist.
      });
    });
  });
});
