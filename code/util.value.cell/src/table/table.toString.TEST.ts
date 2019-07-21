import { expect } from 'chai';
import { table } from '.';

describe('table', () => {
  describe('toString', () => {
    it('default toString (no args)', () => {
      const res = table.toString(undefined as any);
      expect(res).to.eql('[Table]');
    });

    it('empty string (no items)', () => {
      const res = table.toString({ items: [] });
      expect(res).to.eql('');
    });

    it('TSV by ROW (default)', () => {
      const keys = ['B3', 'A2', 'B1', 'A1', 'A3', 'B3']; // Duplicate B3, no B2.
      const items = keys.map(key => ({ key, value: key }));
      const res = table.toString({ items });
      const text = `
A1	B1
A2	
A3	B3`.substring(1);
      expect(res).to.eql(text);
    });
  });
});
