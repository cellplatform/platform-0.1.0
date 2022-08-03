import { expect } from '../test';
import { Url } from './Url';

const origin = 'https://domain.com/';

type Q = {
  force?: boolean;
  color: 'red' | 'blue';
  thing?: string | (boolean | string | number)[];
  text?: string;
};

describe('Url', () => {
  describe('static', () => {
    it('parse: origin', () => {
      const test = (
        input: string | number | undefined,
        host: string,
        port: number,
        protocol: 'http' | 'https',
        origin: string,
      ) => {
        const res = Url.parse(input);
        const hostname = host.replace(/:\d*$/, '');

        expect(res.origin.protocol).to.eql(protocol);
        expect(res.origin.hostname).to.eql(hostname);
        expect(res.origin.host).to.eql(host);
        expect(res.origin.port).to.eql(port);
        expect(res.origin.toString()).to.eql(origin);
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
      test('localhost/foo', 'localhost', 80, 'http', 'http://localhost');

      test('/foo/', 'localhost', 80, 'http', 'http://localhost');
      test('//foo/', 'localhost', 80, 'http', 'http://localhost');

      test('http://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost//', 'localhost', 80, 'http', 'http://localhost');
      test('https://localhost:1234', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
      test('https://localhost:1234//', 'localhost:1234', 1234, 'http', 'http://localhost:1234');
      test('http://localhost/foo', 'localhost', 80, 'http', 'http://localhost');
    });

    it('parse: path', () => {
      const test = (input: string | number | undefined, path: string) => {
        const res = Url.parse(input);
        expect(res.path).to.eql(path);
      };

      test(80, '/');
      test(1234, '/');
      test('', '/');
      test('/', '/');
      test('  ///  ', '/');

      test('localhost', '/');
      test('http://localhost', '/');
      test('  http://localhost/ ', '/');
      test('  http://localhost:8080/ ', '/');
      test('  http://localhost:8080 ', '/');
      test('http://192.168.1:1234//', '/');
      test('https://domain.com//', '/');

      test('  domain.com/foo/bar  ', '/foo/bar');
      test('  domain.com/foo/bar//  ', '/foo/bar//');
      test('https://domain.com/foo?q=123', '/foo?q=123');
      test('  http://localhost:8080/foo/bar? ', '/foo/bar?');

      test('foo/bar', '/bar');
      test('/foo/bar', '/foo/bar');
      test('///foo/bar', '/foo/bar');
      test('///foo/bar/ ', '/foo/bar/');
    });

    it('isLocal', () => {
      const test = (input: string, expected: boolean) => {
        expect(Url.isLocal(input)).to.eql(expected);
      };

      test(undefined as any, false);
      test('localhostess', false);

      test('localhost', true);
      test('localhost:8080', true);
      test('localhost:80', true);
      test('  localhost  ', true);
      test('http://localhost', true);
      test('http://localhost/', true);
      test('https://localhost', true);
      test('//localhost///', true);
      test('localhost/foo/bar?q=123', true);

      test('http://192.168.1', true);
      test('192.168.1', true);
    });
  });

  describe('instance', () => {
    it('origin/path', () => {
      const res = new Url({ origin: 'https://domain.com:8080//', path: '///foo/bar' });
      expect(res.origin.toString()).to.eql('https://domain.com:8080');
      expect(res.origin.host).to.eql('domain.com:8080');
      expect(res.origin.hostname).to.eql('domain.com');
      expect(res.origin.port).to.eql(8080);
      expect(res.path).to.eql('/foo/bar');
    });

    it('no path', () => {
      const test = (path: string | undefined) => {
        const res = new Url({ origin: 'https://domain.com', path });
        expect(res.path).to.eql('/');
        expect(res.toString()).to.eql('https://domain.com/');
      };

      test(undefined);
      test('');
      test('   ');
      test('/');
      test('///');
      test(' /// ');
    });

    it('querystring (from constructor string)', () => {
      const test = (input: string | undefined, expected: string) => {
        const res = new Url({ origin, querystring: input });
        expect(res.querystring).to.eql(expected);
      };

      test(undefined, '');
      test('', '');
      test('  ', '');

      test('foo', '?foo');
      test('foo=bar', '?foo=bar');
      test('  foo=bar&force  ', '?foo=bar&force');
    });

    it('querystring (from constructor object)', () => {
      const test = (query: Partial<Q> | undefined, expected: string) => {
        const res = new Url<Q>({ origin, query });
        expect(res.querystring).to.eql(expected);
      };

      test(undefined, '');
      test({ color: 'red' }, '?color=red');
      test({ force: true }, '?force=true');
      test({ force: true, color: ' blue' as any }, '?force=true&color=blue');
      test({ color: 'blue', force: true }, '?color=blue&force=true');
      test({ force: true, toString: () => 'hello' } as any, '?force=true');

      // NB: Empty strings not inserted into query-string.
      test({ text: '' }, '');
      test({ text: '', force: true }, '?force=true');

      // Array (multiple keys)
      test({ thing: [] }, '');
      test({ thing: ['one', true, false] }, '?thing=one&thing=true&thing=false');
      test({ thing: ['same', '  same  ', 'diff', 'same'] }, '?thing=same&thing=diff'); // NB: de-duped.
    });

    it('add [query] returns a new instance', () => {
      const url1 = new Url<Q>({ origin });
      const url2 = url1.query({ force: true });
      expect(url1).to.not.equal(url2);
      expect(url1.querystring).to.eql('');
      expect(url2.querystring).to.eql('?force=true');
    });

    it('add [query] array (multiple keys)', () => {
      const url = new Url<Q>({ origin }).query({ thing: [true, ' foo ', 123] });
      expect(url.querystring).to.eql('?thing=true&thing=foo&thing=123');
    });

    it('does not add [query] if value is undefined', () => {
      const url = new Url<Q>({ origin }).query({ thing: undefined });
      expect(url.querystring).to.eql('');
    });

    it('build query-string (mixed from object and/or string)', () => {
      const res = new Url<Q>({ origin, querystring: 'boom=bam' })
        .query({ color: 'red' })
        .query({ force: true, color: ' blue  ' } as any);
      expect(res.querystring).to.eql('?color=blue&force=true&boom=bam');
    });

    it('toPath | toString', () => {
      let url = new Url<Q>({ origin, path: '//foo/' });
      expect(url.toString({ origin: false })).to.eql('/foo/');
      expect(url.toString()).to.eql('https://domain.com/foo/');

      url = url.query({ force: true });
      expect(url.toString({ origin: false })).to.eql('/foo/?force=true');
      expect(url.toString()).to.eql('https://domain.com/foo/?force=true');
    });
  });
});
