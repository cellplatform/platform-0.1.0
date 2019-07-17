import { expect } from 'chai';
import { insert, shift, remove } from './table';

describe('table.insert', () => {
  describe('insertColumn', () => {
    const table = {
      A1: 'A1',
      B1: 'B1',
      C1: 'C1',
      D1: 'D1',
      E1: 'E1',
    };

    it('insert at 0', () => {
      const res = insert.column({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.B1).to.eql('A1');
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
      expect(res.E1).to.eql('D1');
      expect(res.F1).to.eql('E1');
      expect(res.G1).to.eql(undefined);
    });

    it('insert at 1', () => {
      const res = insert.column({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql(undefined);
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
      expect(res.E1).to.eql('D1');
      expect(res.F1).to.eql('E1');
      expect(res.G1).to.eql(undefined);
    });

    it('inserts 2 columns at 1', () => {
      const res = insert.column({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql(undefined);
      expect(res.C1).to.eql(undefined);
      expect(res.D1).to.eql('B1');
      expect(res.E1).to.eql('C1');
      expect(res.F1).to.eql('D1');
      expect(res.G1).to.eql('E1');
      expect(res.H1).to.eql(undefined);
    });

    it('inserts custom empty value', () => {
      const table = { A1: 'A1', B1: 'B1', C1: 'C1' };
      const res = insert.column({ table, index: 1, emptyValue: 'hello' });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql('hello'); // Custom empty value.
      expect(res.C1).to.eql('B1');
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
    const table = {
      A1: 'A1',
      A2: 'A2',
      A3: 'A3',
      A4: 'A4',
    };
    it('insert at 0', () => {
      const res = insert.row({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.A2).to.eql('A1');
      expect(res.A3).to.eql('A2');
      expect(res.A4).to.eql('A3');
      expect(res.A5).to.eql('A4');
      expect(res.A6).to.eql(undefined);
    });

    it('insert at 1', () => {
      const res = insert.row({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.A2).to.eql(undefined);
      expect(res.A3).to.eql('A2');
      expect(res.A4).to.eql('A3');
      expect(res.A5).to.eql('A4');
      expect(res.A6).to.eql(undefined);
    });

    it('insert 2 rows at 1', () => {
      const res = insert.row({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1');
      expect(res.A2).to.eql(undefined);
      expect(res.A3).to.eql(undefined);
      expect(res.A4).to.eql('A2');
      expect(res.A5).to.eql('A3');
      expect(res.A6).to.eql('A4');
      expect(res.A7).to.eql(undefined);
    });
  });

  describe('deleteColumn', () => {
    const table = {
      A1: 'A1',
      B1: 'B1',
      C1: 'C1',
      D1: 'D1',
      E1: 'E1',
    };
    it('delete at 0', () => {
      const res = remove.column({ table, index: 0 });
      expect(res.A1).to.eql('B1');
      expect(res.B1).to.eql('C1');
      expect(res.C1).to.eql('D1'); // etc.
      expect(res.E1).to.eql(undefined);
    });

    it('delete at 1', () => {
      const res = remove.column({ table, index: 1 });
      expect(res.A1).to.eql('A1'); // No change.
      expect(res.B1).to.eql('C1');
      expect(res.C1).to.eql('D1'); // etc.
      expect(res.E1).to.eql(undefined);
    });

    it('delete 2 columns at 1', () => {
      const res = remove.column({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1'); // No change.
      expect(res.B1).to.eql('D1');
      expect(res.C1).to.eql('E1'); // etc.
      expect(res.D1).to.eql(undefined);
      expect(res.E1).to.eql(undefined);
    });

    it('removes a single column (no siblings)', () => {
      const table = { A1: '123', A2: 456 };
      const res = remove.column({ table, index: 0 });
      expect(res.A1).to.eql(undefined);
      expect(res.A2).to.eql(undefined);
    });
  });

  describe('deleteRow', () => {
    const table = {
      A1: 'A1',
      A2: 'A2',
      A3: 'A3',
      A4: 'A4',
      A5: 'A5',
    };
    it('delete at 0', () => {
      const res = remove.row({ table, index: 0 });
      expect(res.A1).to.eql('A2');
      expect(res.A2).to.eql('A3');
      expect(res.A3).to.eql('A4');
      expect(res.A4).to.eql('A5');
      expect(res.A5).to.eql(undefined);
    });

    it('delete at 1', () => {
      const res = remove.row({ table, index: 1 });
      expect(res.A1).to.eql('A1'); // No change
      expect(res.A2).to.eql('A3');
      expect(res.A3).to.eql('A4');
      expect(res.A4).to.eql('A5');
      expect(res.A5).to.eql(undefined);
    });

    it('delete 2 rows at 1', () => {
      const res = remove.row({ table, index: 1, total: 2 });
      expect(res.A1).to.eql('A1'); // No change
      expect(res.A2).to.eql('A4');
      expect(res.A3).to.eql('A5');
      expect(res.A4).to.eql(undefined);
      expect(res.A5).to.eql(undefined);
    });
  });
});
