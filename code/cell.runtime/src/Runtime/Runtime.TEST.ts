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
        expect(bundle.host).to.eql('localhost:3000');
        expect(bundle.uri).to.eql('cell:dev:A1'); // NB: "dev" URI.
        expect(bundle.dir).to.eql('');
        expect(bundle.dev).to.eql(true);
      });

      it('from __CELL__', () => {
        const bundle = Runtime.origin(__CELL__);
        expect(bundle.host).to.eql('foo.com');
        expect(bundle.uri).to.eql('cell:foo:A1');
        expect(bundle.dir).to.eql('foobar');
        expect(bundle.dev).to.eql(false);
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
      it('local', () => {
        const bundle = Runtime.origin();
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };
        test('', 'http://localhost:3000/'); // NB: local/dev
        test('  ', 'http://localhost:3000/');
        test('  /foo/img.png  ', 'http://localhost:3000/foo/img.png');
      });

      it('remote (with dir)', () => {
        const bundle = Runtime.origin(__CELL__);
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('   ', 'https://foo.com/cell:foo:A1/file/foobar/');
        test('  /// ', 'https://foo.com/cell:foo:A1/file/foobar/');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/file/foobar/static/foo.png');
        test('index.json', 'https://foo.com/cell:foo:A1/file/foobar/index.json');
      });

      it('remote (no dir)', () => {
        const bundle = Runtime.origin(modify({ dir: '   ' }));
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('  ///index.json  ', 'https://foo.com/cell:foo:A1/file/index.json');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/file/static/foo.png');
      });

      it('remote (ip address)', () => {
        const host = '192.168.1.1';
        const bundle = Runtime.origin(modify({ host }));

        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('  ///index.json  ', `http://${host}/cell:foo:A1/file/foobar/index.json`);
        test('/static/foo.png', `http://${host}/cell:foo:A1/file/foobar/static/foo.png`);
      });
    });
  });
});
