import { Compiler } from '..';
import { expect, Uri } from '../../test';
import { ConfigBuilder } from '../config';

const host = 'localhost';

const create = () => {
  const model = ConfigBuilder.model('foo');
  const builder = Compiler.config(model);
  return { model, builder };
};

describe('Compiler (Tasks)', () => {
  describe('cell', () => {
    it('create: from URI string', () => {
      const cell = Compiler.cell(host, ' cell:foo:A1  ');
      expect(cell.uri.toString()).to.equal('cell:foo:A1');
    });

    it('create: from URI {object}', () => {
      const uri = Uri.cell('cell:foo:A1');
      const cell = Compiler.cell(host, uri);
      expect(cell.uri).to.equal(uri);
    });

    it('throw: non-supported URI', () => {
      const test = (input: any) => {
        const fn = () => Compiler.cell(host, input);
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
        const cell = Compiler.cell(input, 'cell:foo:A1');
        expect(cell.host).to.eql(expected);
      };
      test('  localhost  ', 'http://localhost');
      test('http://localhost', 'http://localhost');
      test('localhost:5000', 'http://localhost:5000');
      test(' foo.com  ', 'https://foo.com');
    });
  });
});
