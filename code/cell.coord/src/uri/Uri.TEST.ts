import { expect } from 'chai';
import { t } from '../common';
import { Uri } from './Uri';

describe('Uri', () => {
  describe('is', () => {
    it('is.uri', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.uri(input)).to.eql(expected);
      };

      test('ns:abcd', true);
      test('cell:abcd!A1', true);
      test('row:abcd!1', true);
      test('col:abcd!A', true);

      test(undefined, false);
      test('', false);
      test('ns:', false);
      test('row:', false);
      test('col:', false);
      test('cell:abcd', false);
      test('row:abcd', false);
      test('col:abcd', false);
    });

    it('is.type', () => {
      const test = (type: t.UriType, input?: string, expected?: boolean) => {
        expect(Uri.is.type(type, input)).to.eql(expected);
      };

      test('ns', 'ns:abcd', true);
      test('cell', 'cell:abcd!A1', true);
      test('col', 'col:abcd!A', true);
      test('row', 'row:abcd!1', true);
      test('UNKNOWN', 'foo:bar!1', true);

      test('ns', undefined, false);
      test('cell', undefined, false);
      test('col', undefined, false);
      test('row', undefined, false);

      test('ns', '', false);
      test('cell', '', false);
      test('col', '', false);
      test('row', '', false);
    });

    it('is.cell', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.cell(input)).to.eql(expected);
      };
      test('cell:abcd!A1', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('col:abcd!A', false);
    });

    it('is.row', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.row(input)).to.eql(expected);
      };
      test('row:abcd!1', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('col:abcd!A', false);
    });

    it('is.column', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.column(input)).to.eql(expected);
      };
      test('col:abcd!A', true);
      test('', false);
      test(undefined, false);
      test('ns:abcd', false);
      test('row:abcd!1', false);
    });
  });

  describe('parse', () => {
    it('ns', () => {
      const res = Uri.parse<t.INsUri>('ns:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('ns');
      expect(res.data.id).to.eql('abcd');
    });

    it('cell', () => {
      const res = Uri.parse<t.ICellUri>('cell:abc!A1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('cell');
      expect(res.data.id).to.eql('abc!A1');
      expect(res.data.ns).to.eql('abc');
      expect(res.data.key).to.eql('A1');
    });

    it('row', () => {
      const res = Uri.parse<t.IRowUri>('row:abc!1');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('row');
      expect(res.data.id).to.eql('abc!1');
      expect(res.data.ns).to.eql('abc');
      expect(res.data.key).to.eql('1');
    });

    it('col', () => {
      const res = Uri.parse<t.IColumnUri>('col:abc!A');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('col');
      expect(res.data.id).to.eql('abc!A');
      expect(res.data.ns).to.eql('abc');
      expect(res.data.key).to.eql('A');
    });

    describe('error', () => {
      it('error: UNKNOWN', () => {
        const test = (input: string | undefined) => {
          const res = Uri.parse(input);
          expect(res.ok).to.eql(false);
          expect(res.data.type).to.eql('UNKNOWN');
          expect(res.text).to.eql((input || '').trim());
          expect(res.error && res.error.message).to.contain('URI not specified');
        };
        test(undefined);
        test('');
        test('   ');
      });

      it('no ":" seperated parts', () => {
        const res = Uri.parse('foo');
        expect(res.ok).to.eql(false);
        expect(res.error && res.error.message).to.contain('Not a valid multi-part URI');
      });

      it('ns: no ID', () => {
        const test = (input?: string) => {
          const res = Uri.parse<t.INsUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain('Namespace ID not found');
        };
        test('ns:');
        test('ns: ');
      });

      it('coord: no namespace', () => {
        const test = (input: string, field: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(`ID of '${field}' not found`);
        };
        test('cell:', 'cell');
        test('row:', 'row');
        test('col:', 'col');
      });

      it('coord: no key', () => {
        const test = (input: string, field: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(`URI does not contain a "!" character`);
          expect(res.data.key).to.eql('');
          expect(res.data.ns).to.eql('');
        };
        test('cell:abcd', 'cell');
        test('row:abcd', 'row');
        test('col:abcd', 'col');
      });
    });
  });

  describe('generate', () => {
    it('ns', () => {
      const res1 = Uri.generate.ns();
      const res2 = Uri.generate.ns({ ns: 'abcd' });

      const uri1 = Uri.parse<t.INsUri>(res1);
      const uri2 = Uri.parse<t.INsUri>(res2);

      expect(uri1.data.type).to.eql('ns');
      expect(uri2.data.type).to.eql('ns');

      expect(uri1.data.id.startsWith('c')).to.eql(true);
      expect(uri1.data.id.length).to.greaterThan(20);

      expect(uri2.data.id).to.eql('abcd');
    });

    it('cell', () => {
      const res1 = Uri.generate.cell({ cell: 'A1' });
      const res2 = Uri.generate.cell({ ns: 'abcd', cell: 'A1' });

      expect(res2).to.eql('cell:abcd!A1');

      const uri1 = Uri.parse<t.ICellUri>(res1);
      const uri2 = Uri.parse<t.ICellUri>(res2);

      expect(uri1.data.type).to.eql('cell');
      expect(uri2.data.type).to.eql('cell');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.key).to.eql('A1');

      expect(uri2.data.ns).to.eql('abcd');
      expect(uri2.data.key).to.eql('A1');
    });

    it('row', () => {
      const res1 = Uri.generate.row({ row: '1' });
      const res2 = Uri.generate.row({ ns: 'abcd', row: '1' });

      expect(res2).to.eql('row:abcd!1');

      const uri1 = Uri.parse<t.IRowUri>(res1);
      const uri2 = Uri.parse<t.IRowUri>(res2);

      expect(uri1.data.type).to.eql('row');
      expect(uri2.data.type).to.eql('row');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.key).to.eql('1');

      expect(uri2.data.ns).to.eql('abcd');
      expect(uri2.data.key).to.eql('1');
    });

    it('column', () => {
      const res1 = Uri.generate.column({ column: 'A' });
      const res2 = Uri.generate.column({ ns: 'abcd', column: 'A' });

      expect(res2).to.eql('col:abcd!A');

      const uri1 = Uri.parse<t.IColumnUri>(res1);
      const uri2 = Uri.parse<t.IColumnUri>(res2);

      expect(uri1.data.type).to.eql('col');
      expect(uri2.data.type).to.eql('col');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.key).to.eql('A');

      expect(uri2.data.ns).to.eql('abcd');
      expect(uri2.data.key).to.eql('A');
    });
  });
});
