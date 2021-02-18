import { Runtime } from '.';
import { expect, t } from '../test';

const __CELL__: t.RuntimeModule = {
  module: { name: 'my-module', version: '1.2.3' },
  origin: {
    host: 'foo.com',
    uri: 'cell:foo:A1',
    dir: 'foobar',
  },
};

const modify = (origin: Partial<t.RuntimeBundleOrigin>): t.RuntimeModule => {
  return {
    ...__CELL__,
    origin: { ...__CELL__.origin, ...origin } as t.RuntimeBundleOrigin,
  };
};

describe('Runtime', () => {
  describe('Module', () => {
    it('from <nothing>', () => {
      const module = Runtime.module();
      expect(module.name).to.eql('');
      expect(module.version).to.eql('');
    });

    it('from __CELL__', () => {
      const module = Runtime.module(__CELL__);
      expect(module.name).to.eql('my-module');
      expect(module.version).to.eql('1.2.3');
    });
  });

  describe('Origin', () => {
    describe('create', () => {
      it('from <nothing>', () => {
        const bundle = Runtime.origin();
        expect(bundle.host).to.eql(''); // NB: Host not available prior to compilation - in "dev" mode.
        expect(bundle.dev).to.eql(true);
        expect(bundle.uri).to.eql('cell:dev:A1'); // NB: "dev" URI.
        expect(bundle.dir).to.eql('');
      });

      it('from __CELL__', () => {
        const bundle = Runtime.origin(__CELL__);
        expect(bundle.host).to.eql('foo.com');
        expect(bundle.dev).to.eql(false); // NB: A host has been compiled into the __CELL__ - not "dev" mode
        expect(bundle.uri).to.eql('cell:foo:A1');
        expect(bundle.dir).to.eql('foobar');
      });

      it('ip address', () => {
        const host = '192.168.1.1';
        const bundle = Runtime.origin(modify({ host }));
        expect(bundle.host).to.eql(host);
      });

      it('formats dir', () => {
        const test = (dir: string, expected: string) => {
          const bundle = Runtime.origin(modify({ dir }));
          expect(bundle.dir).to.eql(expected);
        };
        test('', '');
        test('  ', '');
        test('/', '');
        test('  ///  ', '');
        test('/foo/', 'foo');
        test(' /foo/bar/ ', 'foo/bar');
        test(' ///foo/bar/// ', 'foo/bar');
      });
    });

    describe('path', () => {
      it('local (empty)', () => {
        const bundle = Runtime.origin();
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };
        test('', '/'); // NB: local/dev
        test('  ', '/');
        test('/', '/');
        test('  /foo/img.png  ', '/foo/img.png');
      });

      it('local (__CELL__)', () => {
        const bundleFromHost = (host: string) => Runtime.origin(modify({ host }));
        const test = (input: any, expected: string) => {
          const res1 = bundleFromHost('localhost:5000').path(input);
          const res2 = bundleFromHost('localhost').path(input);
          expect(res1).to.eql(expected);
          expect(res2).to.eql(expected);
        };
        test('', '/cell:foo:A1/fs/foobar/'); // NB: local/dev
        test('  ', '/cell:foo:A1/fs/foobar/'); // NB: local/dev
        test('/', '/cell:foo:A1/fs/foobar/'); // NB: local/dev
        test('  /foo/img.png  ', '/cell:foo:A1/fs/foobar/foo/img.png');
      });

      it('remote (with dir)', () => {
        const bundle = Runtime.origin(__CELL__);
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('   ', 'https://foo.com/cell:foo:A1/fs/foobar/');
        test('  /// ', 'https://foo.com/cell:foo:A1/fs/foobar/');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/fs/foobar/static/foo.png');
        test('index.json', 'https://foo.com/cell:foo:A1/fs/foobar/index.json');
      });

      it('remote (no dir)', () => {
        const bundle = Runtime.origin(modify({ dir: '   ' }));
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('  ///index.json  ', 'https://foo.com/cell:foo:A1/fs/index.json');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/fs/static/foo.png');
      });

      it('remote (ip address)', () => {
        const host = '192.168.1.1';
        const bundle = Runtime.origin(modify({ host }));

        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('  ///index.json  ', `http://${host}/cell:foo:A1/fs/foobar/index.json`);
        test('/static/foo.png', `http://${host}/cell:foo:A1/fs/foobar/static/foo.png`);
      });
    });
  });
});
