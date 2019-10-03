import { expect, testContext, t } from './TEST';
import { func } from '.';

describe('func.calculate', () => {
  describe('binary-expression', () => {
    it('=1+2+3', async () => {
      const ctx = await testContext({
        A1: { value: '=1+2+3' },
      });

      const res = await func.calculate<number>({ cell: 'A1', ...ctx });

      expect(res.ok).to.eql(true);
      expect(res.cell).to.eql('A1');
      expect(res.formula).to.eql('=1+2+3');
      expect(res.error).to.eql(undefined);
      expect(res.data).to.eql(6);
    });

    it('=1+A2+A3', async () => {
      const ctx = await testContext({
        A1: { value: '=1+A2+A3' },
        A2: { value: 5 },
        A3: { value: '=A4' },
        A4: { value: 10 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.ok).to.eql(true);
      expect(res.data).to.eql(16);
    });

    it('mixed: =1 + SUM(4,A3)', async () => {
      const ctx = await testContext({
        A1: { value: '=1 + SUM(4,5)' },
        A2: { value: '=1 + SUM(2,Z9)' },
        A3: { value: '=1 + SUM(2,Z9+1)' },
        Z9: { value: 5 },
      });

      const test = async (cell: string, expected: number) => {
        const res = await func.calculate<number>({ cell, ...ctx });
        expect(res.data).to.eql(expected);
      };

      await test('A1', 10);
      await test('A2', 8);
      await test('A3', 9);
    });

    it('range: =1 + B1:B5', async () => {
      const ctx = await testContext({
        A1: { value: '=1 + B1:B5' },
        B1: { value: 1 },
        B2: { value: 'hello' },
        B3: { value: 3 },
        B5: { value: 5 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(10);
    });
  });

  describe('function', () => {
    it('SUM(1,2,3)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,2,3)' },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.ok).to.eql(true);
      expect(res.cell).to.eql('A1');
      expect(res.formula).to.eql('=SUM(1,2,3)');
      expect(res.error).to.eql(undefined);
      expect(res.data).to.eql(6);
    });

    it('SUM()', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM()' },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(0);
    });

    it('=SUM(1,A2,A3)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,A2,A3)' },
        A2: { value: 5 },
        A3: { value: '=A4' },
        A4: { value: 10 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.ok).to.eql(true);
      expect(res.data).to.eql(16);
    });

    it('mixed: =SUM(1, 2+A3)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, 2+3)' },
        A2: { value: '=SUM(1, 5+Z9)' },
        A3: { value: '=SUM(1, SUM(1,2))' },
        A4: { value: '=SUM(1, SUM(1,Z9))' },
        A5: { value: '=SUM(1, 5+Z9+SUM(1,2))' },
        A6: { value: '=SUM(1, 5+Z9+SUM(1,2+Z9))' },
        Z9: { value: 10 },
      });

      const test = async (cell: string, expected: number) => {
        const res = await func.calculate<number>({ cell, ...ctx });
        expect(res.data).to.eql(expected);
      };

      await test('A1', 6);
      await test('A2', 16);
      await test('A3', 4);
      await test('A4', 12);
      await test('A5', 19);
      await test('A6', 29);
    });

    it('FUNC => FUNC => REF', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, A2)' },
        A2: { value: '=SUM(4,5,A3)' },
        A3: { value: 5 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(15);
    });

    it('range: =SUM(1, B1:B5)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, B1:B10)' },
        B1: { value: 1 },
        B2: { value: 'hello' },
        B3: { value: 3 },
        B5: { value: 5 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(10);

      /**
       * TEMP 🐷
       * - cache (pass around)
       * - IGrid : values => cells
       * - Test: error thrown in func (expected, eg throw new Error("foo"))
       * - Test: circular-ref within range.
       * - Test: range in binary-expr
       */

      // TEMP 🐷

      console.log('-------------------------------------------');
      console.log('res', res);
    });
  });

  describe('errors', () => {
    it('not an formula', async () => {
      const ctx = await testContext({
        A1: { value: '123' },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(res.ok).to.eql(false);
      expect(error.cell.key).to.eql('A1');
      expect(error.cell.value).to.eql('123');
      expect(error.type).to.eql('NOT_FORMULA');
      expect(error.message).to.include('cell A1 is not a formula');
    });

    it('function not found', async () => {
      const ctx = await testContext({
        A1: { value: '=NO_EXIST()' },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(res.ok).to.eql(false);
      expect(error.cell.key).to.eql('A1');
      expect(error.cell.value).to.eql('=NO_EXIST()');
      expect(error.type).to.eql('NOT_FOUND');
      expect(error.message).to.include('function [sys.NO_EXIST] was not found');
    });

    it('ERROR: circular', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, A1)' }, // NB: Reference self in param.
        B1: { value: '=SUM(1, B2)' }, // NB: Reference back to self via another cell.
        B2: { value: '=B3' },
        B3: { value: '=B1' },
        C1: { value: '=C1 + 999' },
        C2: { value: '=123 + C3' },
        C3: { value: '=C2' },
        D1: { value: '=99 + A1' },
        D2: { value: '=99 + SUM(A1,3)' }, // TEMP 🐷 Not reporting error
      });

      const test = async (cell: string, expectPath: string) => {
        const res = await func.calculate<number>({ cell, ...ctx });
        const error = res.error as t.IFuncError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.message).to.include(`leads back to itself (${expectPath})`);
      };

      await test('A1', 'A1/A1');
      await test('B1', 'B1/B2/B3/B1');
      await test('C1', 'C1/C1');
      await test('C2', 'C2/C3/C2');
      await test('D1', 'D1/A1/A1');
      await test('D2', 'D2/A1/A1');
    });
  });
});
