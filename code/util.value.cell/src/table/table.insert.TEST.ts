import { expect } from 'chai';
import { insertRow, insertColumn } from './table';

describe('table.insert', () => {
  it('throws on index out-of-range.', () => {
    const table = { A1: 123 };
    expect(() => insertColumn({ table, index: -1 })).to.throw();
    expect(() => insertRow({ table, index: -1 })).to.throw();
  });

  describe('insertColumn', () => {
    it('insert at 0', () => {
      const table = {
        A1: 'A1',
        B1: 'B1',
        C1: 'C1',
      };
      const res = insertColumn({ table, index: 0 });
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
      const res = insertColumn({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql(undefined);
      expect(res.C1).to.eql('B1');
      expect(res.D1).to.eql('C1');
    });

    it('inserts custom empty value', () => {
      const table = { A1: 'A1', B1: 'B1', C1: 'C1' };
      const res = insertColumn({ table, index: 1, emptyValue: 'hello' });
      expect(res.A1).to.eql('A1');
      expect(res.B1).to.eql('hello');
      expect(res.C1).to.eql('B1');
    });
  });

  describe('insertRow', () => {
    it('insert at 0', () => {
      const table = {
        A1: 'A1',
        A2: 'A2',
        A3: 'A3',
      };
      const res = insertRow({ table, index: 0 });
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
      const res = insertRow({ table, index: 1 });
      expect(res.A1).to.eql('A1');
      expect(res.A2).to.eql(undefined);
      expect(res.A3).to.eql('A2');
      expect(res.A4).to.eql('A3');
    });
  });
});
