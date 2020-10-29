import { Runtime } from '.';
import { expect, t } from '../test';

const __CELL_ENV__: t.GlobalCellEnv = {
  module: { name: 'my-module', version: '1.2.3' },
  bundle: {
    host: 'foo.com',
    cell: 'cell:foo:A1',
    dir: 'foobar',
  },
};

const modify = (bundle: Partial<t.GlobalCellEnvBundle>): t.GlobalCellEnv => {
  return {
    ...__CELL_ENV__,
    bundle: { ...__CELL_ENV__.bundle, ...bundle } as t.GlobalCellEnvBundle,
  };
};

describe('Runtime', () => {
  describe('Module', () => {
    it('from <nothing>', () => {
      const module = Runtime.module();
      expect(module.name).to.eql('');
      expect(module.version).to.eql('');
    });

    it('from __CELL_ENV__', () => {
      const module = Runtime.module(__CELL_ENV__);
      expect(module.name).to.eql('my-module');
      expect(module.version).to.eql('1.2.3');
    });
  });

  describe('Bundle', () => {
    describe('create', () => {
      it('from <nothing>', () => {
        const bundle = Runtime.bundle();
        expect(bundle.host).to.eql('http://localhost:3000');
        expect(bundle.cell).to.eql('cell:dev:A1');
        expect(bundle.dir).to.eql('');
        expect(bundle.isDev).to.eql(true);
      });

      it('from __CELL_ENV__', () => {
        const bundle = Runtime.bundle(__CELL_ENV__);
        expect(bundle.host).to.eql('https://foo.com');
        expect(bundle.cell).to.eql('cell:foo:A1');
        expect(bundle.dir).to.eql('foobar');
        expect(bundle.isDev).to.eql(false);
      });

      it('formats dir', () => {
        const test = (dir: string, expected: string) => {
          const bundle = Runtime.bundle(modify({ dir }));
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
      it(' local', () => {
        const bundle = Runtime.bundle();
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };
        test('', 'http://localhost:3000/');
        test('  ', 'http://localhost:3000/');
        test('  /foo/img.png  ', 'http://localhost:3000/foo/img.png');
      });

      it('remote (with dir)', () => {
        const bundle = Runtime.bundle(__CELL_ENV__);
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('   ', 'https://foo.com/cell:foo:A1/file/foobar/');
        test('  /// ', 'https://foo.com/cell:foo:A1/file/foobar/');
        test('index.json', 'https://foo.com/cell:foo:A1/file/foobar/index.json');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/file/foobar/static/foo.png');
      });

      it('remote (no dir)', () => {
        const bundle = Runtime.bundle(modify({ dir: '   ' }));
        const test = (input: any, expected: string) => {
          const res = bundle.path(input);
          expect(res).to.eql(expected);
        };

        test('  ///index.json  ', 'https://foo.com/cell:foo:A1/file/index.json');
        test('/static/foo.png', 'https://foo.com/cell:foo:A1/file/static/foo.png');
      });
    });
  });
});
