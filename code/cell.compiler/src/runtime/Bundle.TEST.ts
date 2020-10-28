import { expect, t, Uri } from '../test';
import { Bundle } from '.';

const __CELL_ENV__: t.GlobalCellEnv = {
  bundle: { host: 'foo.com', cell: 'cell:foo:A1', dir: 'foobar' },
};

const modify = (bundle: Partial<t.GlobalCellEnvBundle>) => {
  return { ...__CELL_ENV__, bundle: { ...__CELL_ENV__.bundle, ...bundle } };
};

describe.only('Bundle', () => {
  describe('create', () => {
    it('from <nothing>', () => {
      const bundle = Bundle();
      expect(bundle.host).to.eql('http://localhost:3000');
      expect(bundle.cell).to.eql('cell:local:A1');
      expect(bundle.dir).to.eql('');
    });

    it('from __CELL_ENV__', () => {
      const bundle = Bundle(__CELL_ENV__);
      expect(bundle.host).to.eql('https://foo.com');
      expect(bundle.cell).to.eql('cell:foo:A1');
      expect(bundle.dir).to.eql('foobar');
    });

    it('formats dir', () => {
      const test = (dir: string, expected: string) => {
        const bundle = Bundle(modify({ dir }));
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
      const bundle = Bundle();
      const test = (input: any, expected: string) => {
        const res = bundle.path(input);
        expect(res).to.eql(expected);
      };
      test('', '');
      test('  ', '');
      test('  /foo/img.png  ', '/foo/img.png');
    });

    it('remote (with dir)', () => {
      const bundle = Bundle(__CELL_ENV__);
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
      const bundle = Bundle(modify({ dir: '   ' }));
      const test = (input: any, expected: string) => {
        const res = bundle.path(input);
        expect(res).to.eql(expected);
      };

      test('  ///index.json  ', 'https://foo.com/cell:foo:A1/file/index.json');
      test('/static/foo.png', 'https://foo.com/cell:foo:A1/file/static/foo.png');
    });
  });
});
