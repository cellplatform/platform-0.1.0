import { expect } from '../test';
import { Urls } from '.';
import { Uri } from '../uri';

describe('Urls', () => {
  describe('static', () => {
    it('Url.uri', () => {
      expect(Urls.uri).to.equal(Uri);
    });
  });

  describe('fields', () => {
    it('prases default fields (protocol, host, port => origin)', () => {
      const test = (
        input: string | undefined,
        host: string,
        port: number,
        protocol: 'http' | 'https',
        origin: string,
      ) => {
        const res = new Urls(input);
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

  describe('sys', () => {
    const url = new Urls();

    it('info', () => {
      const res = url.sys.info;
      expect(res.toString()).to.eql('http://localhost/.sys');
    });

    it('uid', () => {
      const res = url.sys.uid;
      expect(res.toString()).to.eql('http://localhost/.uid');
    });
  });

  describe('namespace', () => {
    const url = new Urls();

    it('throw if non-namespace URI passed', () => {
      expect(() => url.ns('foo:bar')).to.throw();
      expect(() => url.ns('cell:foo')).to.throw(); // NB: No "!A1" key on the ns.
    });

    it('info (from id)', () => {
      const res = url.ns('foo').info;
      expect(res.toString()).to.eql('http://localhost/ns:foo');
    });

    it('info (from URI)', () => {
      const res1 = url.ns('ns:foo').info;
      const res2 = url.ns('cell:foo!A1').info;
      expect(res1.toString()).to.eql('http://localhost/ns:foo');
      expect(res2.toString()).to.eql('http://localhost/ns:foo');
    });

    it('info (from params object)', () => {
      const res = url.ns({ ns: 'foo' }).info;
      expect(res.toString()).to.eql('http://localhost/ns:foo');
    });

    it('info (with query)', () => {
      const res1 = url.ns('foo').info.query({ cells: true });
      expect(res1.toString()).to.eql('http://localhost/ns:foo?cells=true');

      const res2 = url.ns('foo').info.query({ cells: ['A1', 'B2:Z9'] });
      expect(res2.toString()).to.eql('http://localhost/ns:foo?cells=A1,B2:Z9');
    });
  });

  describe('cell', () => {
    const URI = 'cell:foo!A1';
    const url = new Urls();

    it('throw if non-cell URI passed', () => {
      expect(() => url.cell('foo:bar')).to.throw();
      expect(() => url.cell('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.cell('cell:foo')).to.throw(); //   NB: no "!A1" key (invalid).
      expect(() => url.cell('cell:foo!A')).to.throw(); // NB: column.
      expect(() => url.cell('cell:foo!1')).to.throw(); // NB: row.
    });

    it('info', () => {
      const res = url.cell(URI).info;
      expect(res.toString()).to.eql('http://localhost/cell:foo!A1');
    });

    it('files', () => {
      const res = url.cell(URI).files;
      expect(res.toString()).to.eql('http://localhost/cell:foo!A1/files');
    });

    it('file.byName', () => {
      const res = url.cell(URI).file.byName('  kitten.png   ');
      expect(res.toString()).to.eql('http://localhost/cell:foo!A1/file/kitten.png');
    });

    it('file.byName (throws)', () => {
      const fn = () => url.cell(URI).file.byName('     ');
      expect(fn).to.throw();
    });

    it('file.byIndex', () => {
      const res = url.cell(URI).file.byIndex(5);
      expect(res.toString()).to.eql('http://localhost/cell:foo!A1/files/5');
    });

    it('file.byIndex (throws)', () => {
      const fn = () => url.cell(URI).file.byIndex(undefined as any);
      expect(fn).to.throw();
    });
  });

  describe('row', () => {
    const URI = 'cell:foo!1';
    const url = new Urls();

    it('throw if non-row URI passed', () => {
      expect(() => url.row('foo:bar')).to.throw();
      expect(() => url.row('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.row('cell:foo')).to.throw(); //    NB: no "!A1" key (invalid).
      expect(() => url.row('cell:foo!A1')).to.throw(); // NB: cell.
      expect(() => url.row('cell:foo!A')).to.throw(); //  NB: column.
    });

    it('info', () => {
      const res = url.row(URI).info;
      expect(res.toString()).to.eql('http://localhost/cell:foo!1');
    });
  });

  describe('column', () => {
    const URI = 'cell:foo!A';
    const url = new Urls();

    it('throw if non-row URI passed', () => {
      expect(() => url.column('foo:bar')).to.throw();
      expect(() => url.column('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.column('cell:foo')).to.throw(); //    NB: no "!A1" key (invalid).
      expect(() => url.column('cell:foo!A1')).to.throw(); // NB: cell.
      expect(() => url.column('cell:foo!1')).to.throw(); //  NB: row.
    });

    it('info', () => {
      const res = url.column(URI).info;
      expect(res.toString()).to.eql('http://localhost/cell:foo!A');
    });
  });

  describe('file', () => {
    const uri = 'file:foo:123';
    const url = new Urls();

    it('throw if non-cell URI passed', () => {
      expect(() => url.file('foo:bar')).to.throw();
      expect(() => url.file('ns:foo')).to.throw();
      expect(() => url.file('cell:foo!A1')).to.throw();
      expect(() => url.file('file:boo')).to.throw(); // NB: Invalid file URI.
    });

    it('download', () => {
      const res = url.file(uri).download;
      expect(res.toString()).to.eql('http://localhost/file:foo:123');
    });

    it('info', () => {
      const res = url.file(uri).info;
      expect(res.toString()).to.eql('http://localhost/file:foo:123/info');
    });
  });
});
