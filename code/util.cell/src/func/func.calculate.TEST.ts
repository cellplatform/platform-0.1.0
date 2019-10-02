import { expect, testContext, t } from './TEST';
import { func } from '.';

describe.only('func.calculate', () => {
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

    it('mixed: =SUM(1, 2+3) | =1 + SUM(4,5)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, 2+3)' },
        A2: { value: '=1 + SUM(4,5)' },
      });
      const res1 = await func.calculate<number>({ cell: 'A1', ...ctx });
      const res2 = await func.calculate<number>({ cell: 'A2', ...ctx });
      expect(res1.data).to.eql(6);
      expect(res2.data).to.eql(10);
    });

    it.skip('FUNC => FUNC', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, A2)' },
        A2: { value: '=SUM(4,5)' },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
      console.log('res', res);
      // const res2 = await func.calculate<number>({ key: 'A2', ...ctx });
      // expect(res1.data).to.eql(6);
      // expect(res2.data).to.eql(10);
    });

    it.skip('=SUM(1, B1:B5)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, B1:B5)' },
        B1: { value: 1 },
        B2: { value: 2 },
        B3: { value: 3 },
        B5: { value: 4 },
      });
      const res = await func.calculate<number>({ cell: 'A1', ...ctx });
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
        A1: { value: '=SUM(1, A1)' },
        A2: { value: '=A1' },
        B1: { value: '=SUM(1, B1)' },
      });
      const res1 = await func.calculate<number>({ cell: 'A1', ...ctx });

      console.log('-------------------------------------------');
      console.log('res', res1);
      // const res2 = await func.calculate<number>({ key: 'A2', ...ctx });
      // expect(res1.data).to.eql(6);
      // expect(res2.data).to.eql(10);
    });
  });
});
