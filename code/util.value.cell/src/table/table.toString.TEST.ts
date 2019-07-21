import { expect } from 'chai';
import { table } from '.';

describe('table', () => {
  describe.only('toString', () => {
    const keys = ['B3', 'A2', 'B1', 'A1', 'A3', 'B3']; // Duplicate B3, no B2.
    const items = keys.map(key => ({ key, value: key }));

    it('default toString (no args)', () => {
      const res = table.toString(undefined as any);
      expect(res).to.eql('[Table]');
    });

    it('empty string (no items)', () => {
      const res = table.toString({ items: [] });
      expect(res).to.eql('');
    });

    it('TSV: tab-sepecated-value (default)', () => {
      const text = `
A1	B1
A2	
A3	B3`.substring(1);
      const res = table.toString({ items });
      expect(res).to.eql(text);
    });

    it('transforms values via argument function', () => {
      const res = table.toString({
        items,
        transform: item => (item.value ? `value-${item.value}` : 'FOO'),
      });
      const text = `
value-A1	value-B1
value-A2	FOO
value-A3	value-B3`.substring(1);
      expect(res).to.eql(text);
    });

    it('transforms to CSV (custom delimiter)', () => {
      const text = `
A1,B1
A2,
A3,B3`.substring(1);
      const res = table.toString({ items, delimiter: ',' });
      expect(res).to.eql(text);
    });
  });

  describe.only('fromString', () => {
    const text = `
A1	B1	C1
A2		C2	D2
A3	B3`.substring(1);

    it('empty', () => {
      const test = (text: string) => {
        expect(table.fromString({ text, key: 'A1' })).to.eql([]);
      };
      test('');
      test({} as any);
    });

    it('converts to list (from B1)', () => {
      const res = table.fromString({ text, key: 'B2' });
      expect(res).to.eql([
        { key: 'B2', value: 'A1' },
        { key: 'C2', value: 'B1' },
        { key: 'D2', value: 'C1' },
        { key: 'B3', value: 'A2' },
        { key: 'C3', value: '' },
        { key: 'D3', value: 'C2' },
        { key: 'E3', value: 'D2' },
        { key: 'B4', value: 'A3' },
        { key: 'C4', value: 'B3' },
      ]);
    });
  });
});
