import { Webpack } from '..';
import { expect, Uri } from '../../test';

const host = 'localhost';

const create = () => {
  const model = Webpack.config.model('foo');
  const builder = Webpack.config.create(model);
  return { model, builder };
};

describe('Compiler', () => {
  describe('cell', () => {
    it('create: from URI string', () => {
      const cell = Webpack.cell(host, ' cell:foo:A1  ');
      expect(cell.uri.toString()).to.equal('cell:foo:A1');
    });

    it('create: from URI {object}', () => {
      const uri = Uri.cell('cell:foo:A1');
      const cell = Webpack.cell(host, uri);
      expect(cell.uri).to.equal(uri);
    });

    it('throw: non-supported URI', () => {
      const test = (input: any) => {
        const fn = () => Webpack.cell(host, input);
        expect(fn).to.throw();
      };
      test('');
      test('  ');
      test('ns:foo');
      test('cell:foo:A');
      test('cell:foo:1');
    });

    it('host', () => {
      const test = (input: any, expected: string) => {
        const cell = Webpack.cell(input, 'cell:foo:A1');
        expect(cell.host).to.eql(expected);
      };
      test('  localhost  ', 'http://localhost');
      test('http://localhost', 'http://localhost');
      test('localhost:5000', 'http://localhost:5000');
      test(' foo.com  ', 'https://foo.com');
    });

    it('dir (from model)', () => {
      const { builder } = create();
      const test = (expected: string) => {
        const cell = Webpack.cell(host, 'cell:foo:A1');
        const dir = cell.dir(builder);
        expect(dir.endsWith(expected)).to.eql(true);
      };

      test('node_modules/.cache/cell/cell-foo-A1/web/foo-production');

      builder.mode('dev');
      test('/cell-foo-A1/web/foo-development');

      builder.name('home');
      test('/cell-foo-A1/web/home-development');

      builder.target(false);
      test('/cell-foo-A1/web/home-development');

      builder.target(undefined);
      test('/cell-foo-A1/web/home-development');

      builder.target('  ');
      test('/cell-foo-A1/web/home-development');
    });
  });
});
