import { expect, Mock, Uri, time, expectError, IMockServer } from '../../test';
import { ModuleRegistry } from '.';
import { DomainCellProps } from './types';

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

    it('writes [DomainCellProps]', async () => {
      const { registry, http } = await mockRegistry();

      const domain = registry.domain('  https://domain.com  ');
      const uri = await domain.uri();
      const cell = http.cell(uri);
      const props = (await cell.info()).body.data.props as DomainCellProps;

      expect(props?.title).to.eql('Module Registry (Domain)');
      expect(props?.domain).to.eql('domain.com'); // NB: cleaned.
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
      const host = registry.domain('localhost:1234');

      const res1 = await host.uri();
      const res2 = await host.uri();
      expect(res1.toString()).to.eql(res2.toString());

      const links = (await http.cell(registry.uri).links.read()).body;
      const link = links.cells.find((link) => link.key === 'localhost.1234');
      expect(link?.value).to.eql(res1.toString());
    });
  });

  describe('ModuleRegistryNamespace', () => {
    it('create', async () => {
      const { registry } = await mockRegistry();
      const host = registry.domain('localhost:1234');
      const ns = await host.namespace('  foo.bar  ');

      expect(ns.namespace).to.eql('foo.bar');
      expect(ns.domain.uri).to.eql((await host.uri()).toString());
      expect(ns.domain.name).to.eql('localhost:1234');
    });

    it('throw: invalid namespace', async () => {
      const { registry } = await mockRegistry();
      const host = registry.domain('localhost:1234');

      const test = async (input: any) => {
        const fn = () => host.namespace(input);
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
  });
});
