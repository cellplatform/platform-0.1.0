import { expect } from '../test';
import { Url } from '.';
import { Uri } from '../uri';

describe.only('Url', () => {
  describe('static', () => {
    it('Url.uri', () => {
      expect(Url.uri).to.equal(Uri);
    });
  });

  describe('fields', () => {
    it('constructs parsing default fields (protocol, host, port, origin)', () => {
      const test = (
        input: string | undefined,
        host: string,
        port: number,
        protocol: 'http' | 'https',
        origin: string,
      ) => {
        const res = new Url(input);
        expect(res.protocol).to.eql(protocol);
        expect(res.host).to.eql(host);
        expect(res.port).to.eql(port);
        expect(res.origin).to.eql(origin);
      };

      test('foo.com:1234', 'foo.com', 1234, 'https', 'https://foo.com:1234');
      test('foo.com', 'foo.com', 80, 'https', 'https://foo.com');
      test('foo.com///', 'foo.com', 80, 'https', 'https://foo.com');
      test('http://foo.com', 'foo.com', 80, 'https', 'https://foo.com');
      test('https://foo.com/', 'foo.com', 80, 'https', 'https://foo.com');
      test('foo.com:8080', 'foo.com', 8080, 'https', 'https://foo.com:8080');
      test('//foo.com:8080//', 'foo.com', 8080, 'https', 'https://foo.com:8080');
      test('localhost.foo.com', 'localhost.foo.com', 80, 'https', 'https://localhost.foo.com');

      test(undefined, 'localhost', 80, 'http', 'http://localhost');
      test('', 'localhost', 80, 'http', 'http://localhost');
      test('  ', 'localhost', 80, 'http', 'http://localhost');
      test('localhost', 'localhost', 80, 'http', 'http://localhost');
      test('localhost:1234', 'localhost', 1234, 'http', 'http://localhost:1234');
      test('localhost/', 'localhost', 80, 'http', 'http://localhost');
      test('//localhost///', 'localhost', 80, 'http', 'http://localhost');
      test('http://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost//', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost:1234', 'localhost', 1234, 'http', 'http://localhost:1234');
      test('https://localhost:1234//', 'localhost', 1234, 'http', 'http://localhost:1234');
    });
  });

  describe('namespace (base)', () => {
    const url = new Url();

    it('throw if non-namespace URI passed', () => {
      expect(() => url.ns('foo:bar')).to.throw();
      expect(() => url.ns('cell:foo')).to.throw(); // NB: No "!A1" key on the ns.
    });

    it('from id', () => {
      const res = url.ns('foo').base;
      expect(res.toString()).to.eql('http://localhost/ns:foo');
    });

    it('from URI', () => {
      const res1 = url.ns('ns:foo').base;
      const res2 = url.ns('cell:foo!A1').base;
      expect(res1.toString()).to.eql('http://localhost/ns:foo');
      expect(res2.toString()).to.eql('http://localhost/ns:foo');
    });

    it('query: cells', () => {
      const res1 = url.ns('foo').base.query({ cells: true });
      expect(res1.toString()).to.eql('http://localhost/ns:foo?cells=true');

      const res2 = url.ns('foo').base.query({ cells: ['A1', 'B2:Z9'] });
      expect(res2.toString()).to.eql('http://localhost/ns:foo?cells=A1,B2:Z9');
    });
  });

  describe('cell (base)', () => {
    const url = new Url();

    it('throw if non-cell URI passed', () => {
      expect(() => url.cell('foo:bar')).to.throw();
      expect(() => url.cell('ns:foo')).to.throw();
      expect(() => url.cell('cell:foo')).to.throw(); // NB: No "!A1" key on the ns.
    });

    it('from uri', async () => {
      const res1 = url.cell('cell:foo!A1').base;

      expect(res1.toString()).to.eql('http://localhost/cell:foo!A1');

      console.log('res1', res1.toString());
    });
  });
});
