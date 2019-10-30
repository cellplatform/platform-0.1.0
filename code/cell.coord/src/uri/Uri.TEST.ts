import { expect } from 'chai';
import { t } from '../common';
import { Uri } from './Uri';

describe('Uri', () => {
  describe('is', () => {
    it('is.uri', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.uri(input)).to.eql(expected);
      };

      test('ns:123456', true);
      test('cell:123456!A1', true);
      test('row:123456!1', true);
      test('col:123456!A', true);

      test(undefined, false);
      test('', false);
      test('ns:', false);
      test('row:', false);
      test('col:', false);
      test('cell:123456', false);
      test('row:123456', false);
      test('col:123456', false);
    });

    it('is.type', () => {
      const test = (type: t.UriType, input?: string, expected?: boolean) => {
        expect(Uri.is.type(type, input)).to.eql(expected);
      };

      test('ns', 'ns:123456', true);
      test('cell', 'cell:123456!A1', true);
      test('col', 'col:123456!A', true);
      test('row', 'row:123456!1', true);
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
      test('cell:123!A1', true);
      test('', false);
      test(undefined, false);
      test('ns:123', false);
      test('col:123!A', false);
    });

    it('is.cell', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.cell(input)).to.eql(expected);
      };
      test('cell:123!A1', true);
      test('', false);
      test(undefined, false);
      test('ns:123', false);
      test('col:123!A', false);
    });

    it('is.row', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.row(input)).to.eql(expected);
      };
      test('row:123!1', true);
      test('', false);
      test(undefined, false);
      test('ns:123', false);
      test('col:123!A', false);
    });

    it('is.column', () => {
      const test = (input?: string, expected?: boolean) => {
        expect(Uri.is.column(input)).to.eql(expected);
      };
      test('col:123!A', true);
      test('', false);
      test(undefined, false);
      test('ns:123', false);
      test('row:123!1', false);
    });
  });

  describe('parse', () => {
    it('ns', () => {
      const res = Uri.parse<t.INsUri>('ns:123456');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('ns');
      expect(res.data.id).to.eql('123456');
    });

    it('cell', () => {
      const res = Uri.parse<t.ICellUri>('cell:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('cell');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
      expect(res.data.cell).to.eql('abcd');
    });

    it('row', () => {
      const res = Uri.parse<t.IRowUri>('row:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('row');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
      expect(res.data.row).to.eql('abcd');
    });

    it('col', () => {
      const res = Uri.parse<t.IColumnUri>('col:123456789:abcd');
      expect(res.ok).to.eql(true);
      expect(res.error).to.eql(undefined);
      expect(res.data.type).to.eql('col');
      expect(res.data.id).to.eql('123456789:abcd');
      expect(res.data.ns).to.eql('123456789');
      expect(res.data.column).to.eql('abcd');
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

      it('coord: no part ID', () => {
        const test = (input: string, field: string) => {
          const res = Uri.parse<t.ICellUri>(input);
          expect(res.ok).to.eql(false);
          expect(res.error && res.error.message).to.contain(
            `ID part suffix of '${field}' not found`,
          );
        };
        test('cell:1245678', 'cell');
        test('row:1245678', 'row');
        test('col:1245678', 'col');
      });
    });
  });

  describe('generate', () => {
    it('ns', () => {
      const res1 = Uri.generate.ns();
      const res2 = Uri.generate.ns({ ns: '12345678' });

      const uri1 = Uri.parse<t.INsUri>(res1);
      const uri2 = Uri.parse<t.INsUri>(res2);

      expect(uri1.data.type).to.eql('ns');
      expect(uri2.data.type).to.eql('ns');

      expect(uri1.data.id.startsWith('c')).to.eql(true);
      expect(uri1.data.id.length).to.greaterThan(20);

      expect(uri2.data.id).to.eql('12345678');
    });

    it('cell', () => {
      const res1 = Uri.generate.cell();
      const res2 = Uri.generate.cell({ ns: '12345678' });
      const res3 = Uri.generate.cell({ ns: '12345678', cell: 'foo' });

      expect(res3).to.eql('cell:12345678:foo');

      const uri1 = Uri.parse<t.ICellUri>(res1);
      const uri2 = Uri.parse<t.ICellUri>(res2);

      expect(uri1.data.type).to.eql('cell');
      expect(uri2.data.type).to.eql('cell');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.cell.length).to.greaterThan(6);

      expect(uri2.data.ns).to.eql('12345678');
      expect(uri2.data.cell.length).to.greaterThan(6);
    });

    it('row', () => {
      const res1 = Uri.generate.row();
      const res2 = Uri.generate.row({ ns: '12345678' });
      const res3 = Uri.generate.row({ ns: '12345678', row: 'foo' });

      expect(res3).to.eql('row:12345678:foo');

      const uri1 = Uri.parse<t.IRowUri>(res1);
      const uri2 = Uri.parse<t.IRowUri>(res2);

      expect(uri1.data.type).to.eql('row');
      expect(uri2.data.type).to.eql('row');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.row.length).to.greaterThan(6);

      expect(uri2.data.ns).to.eql('12345678');
      expect(uri2.data.row.length).to.greaterThan(6);
    });

    it('column', () => {
      const res1 = Uri.generate.column();
      const res2 = Uri.generate.column({ ns: '12345678' });
      const res3 = Uri.generate.column({ ns: '12345678', column: 'foo' });

      expect(res3).to.eql('col:12345678:foo');

      const uri1 = Uri.parse<t.IColumnUri>(res1);
      const uri2 = Uri.parse<t.IColumnUri>(res2);

      expect(uri1.data.type).to.eql('col');
      expect(uri2.data.type).to.eql('col');

      expect(uri1.data.ns.startsWith('c')).to.eql(true);
      expect(uri1.data.ns.length).to.greaterThan(20);
      expect(uri1.data.column.length).to.greaterThan(6);

      expect(uri2.data.ns).to.eql('12345678');
      expect(uri2.data.column.length).to.greaterThan(6);
    });
  });
});
