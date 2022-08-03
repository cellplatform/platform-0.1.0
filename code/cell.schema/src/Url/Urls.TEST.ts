import { expect, t } from '../test';
import { Urls } from '.';
import { Uri } from '../Uri';

describe('Urls', () => {
  describe('static', () => {
    it('Url.uri', () => {
      expect(Urls.Uri).to.equal(Uri);
    });
  });

  describe('fields', () => {
    it('parse (protocol, host, port => origin)', () => {
      const test = (
        input: string | number | undefined,
        host: string,
        port: number,
        protocol: 'http' | 'https',
        origin: string,
      ) => {
        const res1 = Urls.parse(input);
        const res2 = Urls.create(input);
        const hostname = host.replace(/:\d*$/, '');

        expect(res1.origin.protocol).to.eql(protocol);
        expect(res1.origin.hostname).to.eql(hostname);
        expect(res1.origin.host).to.eql(host);
        expect(res1.origin.port).to.eql(port);
        expect(res1.origin.toString()).to.eql(origin);

        expect(res1.origin.protocol).to.eql(res2.protocol);
        expect(res1.origin.hostname).to.eql(res2.hostname);
        expect(res1.origin.host).to.eql(res2.host);
        expect(res1.origin.port).to.eql(res2.port);
        expect(res1.origin.toString()).to.eql(res2.origin);
      };

      test('foo.com:1234', 'foo.com:1234', 1234, 'https', 'https://foo.com:1234');

      test('foo.com', 'foo.com', 80, 'https', 'https://foo.com');
      test('foo.com///', 'foo.com', 80, 'https', 'https://foo.com');
      test('http://foo.com', 'foo.com', 80, 'https', 'https://foo.com');
      test('https://foo.com/', 'foo.com', 80, 'https', 'https://foo.com');
      test('foo.com:8080', 'foo.com:8080', 8080, 'https', 'https://foo.com:8080');
      test('localhost.foo.com', 'localhost.foo.com', 80, 'https', 'https://localhost.foo.com');

      test(undefined, 'localhost', 80, 'http', 'http://localhost');
      test('', 'localhost', 80, 'http', 'http://localhost');
      test('  ', 'localhost', 80, 'http', 'http://localhost');

      test('1234', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
      test(1234, 'localhost:1234', 1234, 'http', 'http://localhost:1234');

      test(80, 'localhost', 80, 'http', 'http://localhost');
      test('80', 'localhost', 80, 'http', 'http://localhost');

      test('localhost', 'localhost', 80, 'http', 'http://localhost');
      test('localhost:1234', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
      test('localhost/', 'localhost', 80, 'http', 'http://localhost');
      test('http://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost//', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost:1234', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
      test('https://localhost:1234//', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
    });
  });

  describe('sys', () => {
    const url = Urls.create();

    it('info', () => {
      const res = url.sys.info;
      expect(res.toString()).to.eql('http://localhost/.sys');
    });

    it('uid', () => {
      const res = url.sys.uid;
      expect(res.toString()).to.eql('http://localhost/.uid');
      expect(res.query({ total: 2 }).toString()).to.eql('http://localhost/.uid?total=2');
    });
  });

  describe('local', () => {
    const url = Urls.create();
    it('fs', () => {
      const res = url.local.fs;
      expect(res.toString()).to.eql('http://localhost/local/fs');
    });
  });

  describe('namespace (ns)', () => {
    const URI = 'ns:foo';
    const url = Urls.create();

    it('uri', () => {
      const res = url.ns(URI);
      expect(res.uri).to.eql(URI);
    });

    it('uri (from raw namespace id)', () => {
      const res = url.ns('foo');
      expect(res.uri).to.eql('ns:foo');
    });

    it('throw if non-namespace URI passed', () => {
      expect(() => url.ns('foo:bar')).to.throw();
      expect(() => url.ns('cell:foo')).to.throw(); // NB: No ":A1" coordinate key on the ns.
    });

    it('info', () => {
      const res1 = url.ns('foo').info;
      const res2 = url.ns('ns:foo').info;
      const res3 = url.ns('cell:foo:A1').info; // NB: Flips from "cell:" to "ns:"
      const res4 = url.ns({ id: 'foo', type: 'NS' }).info;

      const URL = 'http://localhost/ns:foo';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
      expect(res3.toString()).to.eql(URL);
      expect(res4.toString()).to.eql(URL);
    });

    it('info (with query)', () => {
      const ns = url.ns('foo');

      const res1 = ns.info.query({ cells: true });
      expect(res1.toString()).to.eql('http://localhost/ns:foo?cells=true');

      const res2 = ns.info.query({ cells: ['A1', 'B2:Z9'] });
      expect(res2.toString()).to.eql('http://localhost/ns:foo?cells=A1&cells=B2:Z9');

      const res3 = ns.info.query({ rows: '1:9' });
      expect(res3.toString()).to.eql('http://localhost/ns:foo?rows=1:9');

      const res4 = ns.info.query({ columns: 'A:Z' });
      expect(res4.toString()).to.eql('http://localhost/ns:foo?columns=A:Z');

      const res5 = ns.info.query({ files: true });
      expect(res5.toString()).to.eql('http://localhost/ns:foo?files=true');

      const res6 = ns.info.query({ total: true });
      expect(res6.toString()).to.eql('http://localhost/ns:foo?total=true');

      const res7 = ns.info.query({ total: 'rows' });
      expect(res7.toString()).to.eql('http://localhost/ns:foo?total=rows');

      const res8 = ns.info.query({ total: ['rows', 'columns', 'rows'] }); // NB: de-duped.
      expect(res8.toString()).to.eql('http://localhost/ns:foo?total=rows&total=columns');

      const res9 = ns.info.query({ total: ['rows', 'files'] });
      expect(res9.toString()).to.eql('http://localhost/ns:foo?total=rows&total=files');
    });
  });

  describe('cell', () => {
    const URI = 'cell:foo:A1';
    const url = Urls.create();

    it('uri', () => {
      const res = url.cell(URI);
      expect(res.uri).to.eql(URI);
    });

    it('throw if non-cell URI passed', () => {
      expect(() => url.cell('foo:bar')).to.throw();
      expect(() => url.cell('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.cell('cell:foo')).to.throw(); //   NB: no ":A1" key (invalid).
      expect(() => url.cell('cell:foo:A')).to.throw(); // NB: column.
      expect(() => url.cell('cell:foo:1')).to.throw(); // NB: row.
    });

    it('info', () => {
      const res1 = url.cell(URI).info;
      const res2 = url.cell(Uri.cell('cell:foo:A1')).info;

      const URL = 'http://localhost/cell:foo:A1';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });

    describe('fs (files)', () => {
      it('fs.list', () => {
        const res1 = url.cell(URI).files.list;
        const res2 = url.cell(Uri.cell('cell:foo:A1')).files.list;

        const URL = 'http://localhost/cell:foo:A1/fs';
        expect(res1.query({}).toString()).to.eql(URL);
        expect(res2.toString()).to.eql(URL);
      });

      it('fs.list (filter)', () => {
        const URL = 'http://localhost/cell:foo:A1/fs';

        const list = url.cell(URI).files.list;
        expect(list.toString()).to.eql(URL);

        const res = list.query({ filter: 'foo/bar' });
        expect(res.query({ filter: 'foo/bar' }).toString()).to.eql(URL + '?filter=foo/bar');
        expect(res.query({ filter: '/foo/bar' }).toString()).to.eql(URL + '?filter=/foo/bar');
      });

      it('fs.delete', () => {
        const res1 = url.cell(URI).files.delete;
        const res2 = url.cell(Uri.cell('cell:foo:A1')).files.delete;

        const URL = 'http://localhost/cell:foo:A1/fs';
        expect(res1.toString()).to.eql(URL);
        expect(res2.toString()).to.eql(URL);
      });

      it('fs.copy', () => {
        const res1 = url.cell(URI).files.copy;
        const res2 = url.cell(Uri.cell('cell:foo:A1')).files.copy;

        const URL = 'http://localhost/cell:foo:A1/fs:copy';
        expect(res1.toString()).to.eql(URL);
        expect(res2.toString()).to.eql(URL);
      });

      it('fs.upload (start)', () => {
        const res1 = url.cell(URI).files.upload;
        const res2 = res1.query({ changes: true });
        const res3 = url.cell(Uri.cell('cell:foo:A1')).files.upload;

        const URL = 'http://localhost/cell:foo:A1/fs:upload';
        expect(res1.toString()).to.eql(URL);
        expect(res2.toString()).to.eql(`${URL}?changes=true`);
        expect(res3.toString()).to.eql(URL);
      });

      it('fs.uploaded (complete)', () => {
        const res1 = url.cell(URI).files.uploaded;
        const res2 = res1.query({ changes: true });
        const res3 = url.cell(Uri.cell('cell:foo:A1')).files.uploaded;

        const URL = 'http://localhost/cell:foo:A1/fs:uploaded';
        expect(res1.toString()).to.eql(URL);
        expect(res2.toString()).to.eql(`${URL}?changes=true`);
        expect(res3.toString()).to.eql(URL);
      });
    });

    describe('fs (file)', () => {
      it('file.toString()', () => {
        const file = url.cell(URI).file;
        expect(file.toString()).to.eql('/cell:foo:A1/fs/');
      });

      it('file.byName', () => {
        const res1 = url.cell(URI).file.byName('  kitten.png   ');
        const res2 = url.cell(Uri.cell('cell:foo:A1')).file.byName('kitten.png');

        const URL = 'http://localhost/cell:foo:A1/fs/kitten.png';
        expect(res1.toString()).to.eql(URL);
        expect(res2.toString()).to.eql(URL);
      });

      it('file.byName (throws)', () => {
        const fn = () => url.cell(URI).file.byName('     ');
        expect(fn).to.throw();
      });

      it('file.byFileUri', () => {
        const test = (fileUri: string, fileExtension: string | undefined, expected: string) => {
          const res = url.cell(URI).file.byFileUri(fileUri, fileExtension);
          expect(res.toString()).to.eql(expected);
        };
        test('file:foo:123', 'png', 'http://localhost/cell:foo:A1/file:123.png');
        test('file:foo:123', '.png', 'http://localhost/cell:foo:A1/file:123.png');
        test('file:foo:123', ' ...png ', 'http://localhost/cell:foo:A1/file:123.png');
        test('  file:foo:123  ', '  png  ', 'http://localhost/cell:foo:A1/file:123.png');
        test('file:foo:123', '', 'http://localhost/cell:foo:A1/file:123');
        test('file:foo:123', '  ', 'http://localhost/cell:foo:A1/file:123');
        test('file:foo:123', undefined, 'http://localhost/cell:foo:A1/file:123');
      });

      it('file.byFileUri (throws)', () => {
        expect(() => url.cell(URI).file.byFileUri('cell:foo:A1')).to.throw(); // Not a [file:] URI.
        expect(() => url.cell(URI).file.byFileUri('foo:123')).to.throw();
        expect(() => url.cell(URI).file.byFileUri('')).to.throw();
        expect(() => url.cell(URI).file.byFileUri('  ')).to.throw();
      });
    });
  });

  describe('row', () => {
    const URI = 'cell:foo:1';
    const url = Urls.create();

    it('uri', () => {
      const res = url.row(URI);
      expect(res.uri).to.eql(URI);
    });

    it('throw if non-row URI passed', () => {
      expect(() => url.row('foo:bar')).to.throw();
      expect(() => url.row('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.row('cell:foo')).to.throw(); //    NB: no ":A1" key (invalid).
      expect(() => url.row('cell:foo:A1')).to.throw(); // NB: cell.
      expect(() => url.row('cell:foo:A')).to.throw(); //  NB: column.
    });

    it('info', () => {
      const res1 = url.row(URI).info;
      const res2 = url.row(Uri.row('cell:foo:1')).info;

      const URL = 'http://localhost/cell:foo:1';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });
  });

  describe('column', () => {
    const URI = 'cell:foo:A';
    const url = Urls.create();

    it('uri', () => {
      const res = url.column(URI);
      expect(res.uri).to.eql(URI);
    });

    it('throw if non-row URI passed', () => {
      expect(() => url.column('foo:bar')).to.throw();
      expect(() => url.column('ns:foo')).to.throw();

      // Invalid cell key.
      expect(() => url.column('cell:foo')).to.throw(); //    NB: no ":A1" key (invalid).
      expect(() => url.column('cell:foo:A1')).to.throw(); // NB: cell.
      expect(() => url.column('cell:foo:1')).to.throw(); //  NB: row.
    });

    it('info', () => {
      const res1 = url.column(URI).info;
      const res2 = url.column(Uri.column('cell:foo:A')).info;

      const URL = 'http://localhost/cell:foo:A';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });
  });

  describe('file', () => {
    const URI = 'file:foo:123';
    const url = Urls.create();

    it('uri', () => {
      const res = url.file(URI);
      expect(res.uri).to.eql(URI);
    });

    it('throw if non-cell URI passed', () => {
      expect(() => url.file('foo:bar')).to.throw();
      expect(() => url.file('ns:foo')).to.throw();
      expect(() => url.file('cell:foo:A1')).to.throw();
      expect(() => url.file('file:boo')).to.throw(); // NB: Invalid file URI.
    });

    it('info', () => {
      const res1 = url.file(URI).info;
      const res2 = url.file(Uri.file('file:foo:123')).info;

      const URL = 'http://localhost/file:foo:123/info';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });

    it('download', () => {
      const res1 = url.file(URI).download;
      const res2 = url.file(Uri.file('file:foo:123')).download;

      const URL = 'http://localhost/file:foo:123';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });

    it('delete', () => {
      const res1 = url.file(URI).delete;
      const res2 = url.file(Uri.file('file:foo:123')).delete;

      const URL = 'http://localhost/file:foo:123';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });

    it('uploaded', () => {
      const res1 = url.file(URI).uploaded;
      const res2 = url.file(Uri.file('file:foo:123')).uploaded;

      const URL = 'http://localhost/file:foo:123/uploaded';
      expect(res1.toString()).to.eql(URL);
      expect(res2.toString()).to.eql(URL);
    });
  });

  describe('fn (function runtime)', () => {
    it('fn:run', () => {
      const urls = Urls.create();
      expect(urls.fn.run.toString()).to.eql('http://localhost/fn:run');
    });

    describe('bundle.manifest (file)', () => {
      it('dir variants', () => {
        const test = (dir: string | undefined, expected: string) => {
          const bundle: t.RuntimeBundleOrigin___TEMP = {
            host: 'localhost',
            uri: 'cell:foo:A1',
            dir,
          };
          const urls = Urls.create();
          const res = urls.fn.bundle.manifest(bundle);
          expect(res.toString()).to.eql(expected);
        };

        test(undefined, 'http://localhost/cell:foo:A1/fs/index.json');
        test('  v1.2.3  ', 'http://localhost/cell:foo:A1/fs/v1.2.3/index.json');
        test('  //foo/v1.2.3//  ', 'http://localhost/cell:foo:A1/fs/foo/v1.2.3/index.json');
      });

      it('strips HTTP on host mismatch check', () => {
        const urls = Urls.create('domain.com');
        const bundle: t.RuntimeBundleOrigin___TEMP = {
          host: 'https://domain.com',
          uri: 'cell:foo:A1',
        };
        const res = urls.fn.bundle.manifest(bundle);
        expect(urls.host).to.eql('domain.com');
        expect(res.toString()).to.eql('https://domain.com/cell:foo:A1/fs/index.json');
      });

      it('throw if host mismatch', () => {
        const test = (host1: string, host2: string) => {
          const urls = Urls.create(host1);
          const bundle: t.RuntimeBundleOrigin___TEMP = { host: host2, uri: 'cell:foo:A1' };
          const fn = () => urls.fn.bundle.manifest(bundle);
          expect(fn).to.throw(/Host mismatch/);
        };

        test('localhost', 'localhost:1234');
        test('domain.com', 'foo.com');
        test('domain.com:8080', 'domain.com:1234');
      });
    });

    describe('bundle.files', () => {
      it('dir variants', () => {
        const test = (dir: string | undefined, expected: string) => {
          const bundle: t.RuntimeBundleOrigin___TEMP = {
            host: 'localhost',
            uri: 'cell:foo:A1',
            dir,
          };
          const urls = Urls.create();
          const res = urls.fn.bundle.files(bundle);
          expect(res.toString()).to.eql(expected);
        };

        test(undefined, 'http://localhost/cell:foo:A1/fs');
        test('  v1.2.3  ', 'http://localhost/cell:foo:A1/fs?filter=v1.2.3/**');
        test('  //foo/v1.2.3//  ', 'http://localhost/cell:foo:A1/fs?filter=foo/v1.2.3/**');
      });

      it('strips HTTP on host mismatch check', () => {
        const urls = Urls.create('domain.com');
        const bundle: t.RuntimeBundleOrigin___TEMP = {
          host: 'https://domain.com',
          uri: 'cell:foo:A1',
        };
        const res = urls.fn.bundle.files(bundle);
        expect(urls.host).to.eql('domain.com');
        expect(res.toString()).to.eql('https://domain.com/cell:foo:A1/fs');
      });

      it('throw if host mismatch', () => {
        const test = (host1: string, host2: string) => {
          const urls = Urls.create(host1);
          const bundle: t.RuntimeBundleOrigin___TEMP = { host: host2, uri: 'cell:foo:A1' };
          const fn = () => urls.fn.bundle.files(bundle);
          expect(fn).to.throw(/Host mismatch/);
        };

        test('localhost', 'localhost:1234');
        test('domain.com', 'foo.com');
        test('domain.com:8080', 'domain.com:1234');
      });
    });
  });
});
