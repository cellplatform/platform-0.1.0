import { expect } from 'chai';
import { insert } from './table';

describe('table.insert', () => {
  it('throws on index out-of-range.', () => {
    const table = { A1: 123 };
    expect(() => insert.column({ table, index: -1 })).to.throw();
    expect(() => insert.row({ table, index: -1 })).to.throw();
  });

  describe('insertColumn', () => {
    it('insert at 0', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      const res = insert.column({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.B1).to.eql('A1');
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
    });

    it('insert at 1', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      const res = insert.column({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql(undefined);
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
    });

    it('inserts custom empty value', () => {
      const table = { A1: 'A1', B1: 'B1', C1: 'C1' };
      const res = insert.column({ table, index: 1, emptyValue: 'hello' });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql('hello');
      expect(res.C1).to.eql('B1');
    });

    it('inserts 2 columns at 1', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      const res = insert.column({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql(undefined);
      expect(res.C1).to.eql(undefined);
      expect(res.D1).to.eql('B1');
      expect(res.E1).to.eql('C1');
    });

    it('does nothing if total less than 1', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      expect(insert.column({ table, index: 1, total: 0 })).to.equal(table);
      expect(insert.column({ table, index: 1, total: -1 })).to.equal(table);
      expect(insert.column({ table, index: 1, total: -99 })).to.equal(table);
    });
  });

  describe('insertRow', () => {
    it('insert at 0', () => {
      const table = {
        A1: 'A1',
        A2: 'A2',
        A3: 'A3',
      };
      const res = insert.row({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.A2).to.eql('A1');
      expect(res.A3).to.eql('A2');
      expect(res.A4).to.eql('A3');
    });

    it('insert at 1', () => {
      const table = {
        A1: 'A1',
        A2: 'A2',
        A3: 'A3',
      };
      const res = insert.row({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.A2).to.eql(undefined);
      expect(res.A3).to.eql('A2');
      expect(res.A4).to.eql('A3');
    });

    it('insert 2 rows at 1', () => {
      const table = {
        A1: 'A1',
        A2: 'A2',
        A3: 'A3',
      };
      const res = insert.row({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1');
      expect(res.A2).to.eql(undefined);
      expect(res.A3).to.eql(undefined);
      expect(res.A4).to.eql('A2');
      expect(res.A5).to.eql('A3');
    });
  });

  describe('deleteColumn', () => {
    it('delete at 0', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      const res = insert.column({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.B1).to.eql('A1');
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
    });
  });
});
