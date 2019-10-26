import { expect, t, time, toContext, Subject, getFunc } from '../test';
import { one } from './calculate.one';

export const testContext = async (
  cells: t.ICellTable,
  options: { getFunc?: t.GetFunc; delay?: number } = {},
) => {
  const { refs, getValue, getFunc } = await toContext(cells, options);
  return { refs, getValue, getFunc };
};

describe('func.calc.cell (one)', function() {
  this.timeout(5000);

  describe('errors', () => {
    it('error: not an formula (VALUE)', async () => {
      const ctx = await testContext({
        A1: { value: '123' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(res.ok).to.eql(false);
      expect(error.path).to.eql('A1');
      expect(error.formula).to.eql('123');
      expect(error.type).to.eql('FUNC/notFormula');
      expect(error.message).to.include('cell A1 is not a formula');
    });
  });

  describe('response', () => {
    it('has elapsed time', async () => {
      const ctx = await testContext({
        A1: { value: '=A2' },
        A2: { value: 123 },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.elapsed).to.be.a('number');
    });

    it('has execution identifier (eid) - generated', async () => {
      const ctx = await testContext({
        A1: { value: '=A2' },
        A2: { value: 123 },
      });
      const wait = one<number>({ cell: 'A1', ...ctx });
      expect(wait.eid.length).to.greaterThan(3);

      const res = await wait;
      expect(res.eid.length).to.greaterThan(3);
      expect(res.eid).to.eql(wait.eid);
    });

    it('has execution identifier (eid) - specified', async () => {
      const ctx = await testContext({
        A1: { value: '=A2' },
        A2: { value: 123 },
      });
      const wait = one<number>({ cell: 'A1', ...ctx, eid: 'foo' });
      expect(wait.eid).to.eql('foo');

      const res = await wait;
      expect(res.elapsed).to.be.a('number');
      expect(res.eid).to.eql('foo');
      expect(res.eid).to.eql(wait.eid);
    });
  });

  describe('events (observable)', () => {
    it('fires start/end events', async () => {
      const ctx = await testContext(
        {
          A1: { value: '=A2+1' },
          A2: { value: 123 },
        },
        { delay: 10 },
      );

      const events: t.FuncOneEvent[] = [];
      const events$ = new Subject<t.FuncEvent>();
      events$.subscribe(e => events.push(e as t.FuncOneEvent));

      const wait = one<number>({ cell: 'A1', events$, ...ctx });
      await time.wait(0);

      expect(events.length).to.eql(1);
      expect(events[0].type).to.eql('FUNC/begin');
      expect(events[0].payload.cell).to.eql('A1');
      expect(events[0].payload.formula).to.eql('=A2+1');

      const res = await wait;

      expect(events.length).to.eql(2);
      expect(events[0].payload.eid).to.eql(res.eid);
      expect(events[1].type).to.eql('FUNC/end');
      expect(events[1].payload).to.eql(res);
    });
  });

  describe('cell reference', () => {
    it('=A2', async () => {
      const ctx = await testContext({
        A1: { value: '=A2' },
        A2: { value: 123 },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });

      expect(res.ok).to.eql(true);
      expect(res.type).to.eql('REF');
      expect(res.elapsed).to.be.a('number');
      expect(res.eid.length).to.greaterThan(3);
      expect(res.cell).to.eql('A1');
      expect(res.formula).to.eql('=A2');
      expect(res.error).to.eql(undefined);
      expect(res.data).to.eql(123);
    });

    it('=$A$2 (absolute)', async () => {
      const test = async (A1: string) => {
        const ctx = await testContext({
          A1: { value: A1 },
          A2: { value: 123 },
        });
        const res = await one({ cell: 'A1', ...ctx });
        expect(res.data).to.eql(123);
      };

      await test('=A2');
      await test('=$A2');
      await test('=A$2');
      await test('=$A$2');
    });

    it('=A2 (value not found)', async () => {
      const ctx = await testContext({
        A1: { value: '=A2' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql('');
    });

    it('error: =A1:Z9 (NOT_SUPPORTED)', async () => {
      const ctx = await testContext({
        A1: { value: '=A1:Z9' },
        A2: { value: 123 },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(res.ok).to.eql(false);
      expect(res.type).to.eql('RANGE');
      expect(res.cell).to.eql('A1');
      expect(res.formula).to.eql('=A1:Z9');
      expect(res.data).to.eql(undefined);

      expect(error.type).to.eql('FUNC/notSupported/range');
      expect(error.message).to.include('cell A1 is a range which is not supported');
      expect(error.path).to.eql('A1');
      expect(error.formula).to.eql('=A1:Z9');
    });
  });

  describe('function', () => {
    it('SUM(1,2,3)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,2,3)' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.ok).to.eql(true);
      expect(res.elapsed).to.be.a('number');
      expect(res.eid.length).to.greaterThan(3);
      expect(res.cell).to.eql('A1');
      expect(res.type).to.eql('FUNC');
      expect(res.formula).to.eql('=SUM(1,2,3)');
      expect(res.error).to.eql(undefined);
      expect(res.data).to.eql(6);
    });

    it('SUM()', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM()' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(0);
    });

    it('=SUM(1,A2,A3)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1,A2,A3)' },
        A2: { value: 5 },
        A3: { value: '=A4' },
        A4: { value: 10 },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
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
        const res = await one<number>({ cell, ...ctx });
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
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(15);
    });

    it('range: =SUM(1, B1:B10)', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, B1:B10)' },
        B1: { value: 1 },
        B2: { value: 'hello' },
        B3: { value: 3 },
        B5: { value: 5 },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(10);
    });

    it('range: =SUM(B1:B10) - range contains FUNCs', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(B1:B10)' },
        B1: { value: 1 },
        B2: { value: '=1+B3' },
        B3: { value: '=SUM(1,2)' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(8);
    });
  });

  describe('errors', () => {
    it('error: function not found', async () => {
      const ctx = await testContext({
        A1: { value: '=NO_EXIST()' },
      });
      const res = await one<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(res.ok).to.eql(false);
      expect(error.path).to.eql('A1');
      expect(res.elapsed).to.be.a('number');
      expect(res.eid.length).to.greaterThan(3);
      expect(error.formula).to.eql('=NO_EXIST()');
      expect(error.type).to.eql('FUNC/notFound');
      expect(error.message).to.include('function [sys.NO_EXIST] was not found');
    });

    it('error: circular', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, A1)' }, // NB: Reference self in param.
        B1: { value: '=SUM(1, B2)' }, // NB: Reference back to self via another cell.
        B2: { value: '=B3' },
        B3: { value: '=B1' },
        C1: { value: '=C1 + 999' },
        C2: { value: '=123 + C3' },
        C3: { value: '=C2' },
        D1: { value: '=99 + A1' },
        D2: { value: '=99 + SUM(A1,3)' },
      });

      const test = async (cell: string, expectPath: string) => {
        const res = await one<number>({ cell, ...ctx });
        const error = res.error as t.IFuncError;
        expect(res.elapsed).to.be.a('number');
        expect(error.type).to.eql('REF/circular');
        expect(error.path).to.eql(expectPath);
        expect(error.message).to.include(`leads back to itself (${expectPath})`);
      };

      await test('A1', 'A1/A1');
      await test('B1', 'B1/B2/B3/B1');
      await test('C1', 'C1/C1');
      await test('C2', 'C2/C3/C2');
      await test('D1', 'D1/A1/A1');
      await test('D2', 'D2/A1/A1');
    });

    it('error: circular range', async () => {
      const ctx = await testContext({
        A1: { value: '=SUM(1, A1:A5)' }, //         NB: Reference self in range.
        A2: { value: '=1 + A1:A5' }, //             NB: Reference self in range.
        A3: { value: '=SUM(1, A1:A5, Z5:Z15)' }, // NB: Reference from one range into another.
        B1: { value: 1 },
        B2: { value: 'hello' },
        B3: { value: 3 },
        Z9: { value: '=A1' },
      });

      const test = async (cell: string, expectPath: string) => {
        const res = await one<number>({ cell, ...ctx });
        const error = res.error as t.IFuncError;
        expect(error.path).to.eql(expectPath);
        expect(error.type).to.eql('REF/circular');
        expect(error.message).to.include(`leads back to itself (${expectPath})`);
      };

      await test('A1', 'A1/A1:A5');
      await test('A2', 'A2/A1:A5');
      await test('A3', 'A3/A1:A5');
    });

    it('error within evaluating func', async () => {
      const ctx = await testContext(
        { A1: { value: '=SUM(1,2)' } },
        {
          getFunc: async args => {
            return async args => {
              throw new Error('Derp');
            };
          },
        },
      );
      const res = await one<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(error.type).to.eql('FUNC/invoke');
      expect(error.message).to.eql('Derp');
      expect(error.path).to.eql('A1');
      expect(error.formula).to.eql('=SUM(1,2)');
    });

    it('error within finding func (getFunc)', async () => {
      const ctx = await testContext(
        { A1: { value: '=SUM(1,2)' } },
        {
          getFunc: async args => {
            throw new Error('Not found');
          },
        },
      );
      const res = await one<number>({ cell: 'A1', ...ctx });
      const error = res.error as t.IFuncError;

      expect(error.type).to.eql('FUNC/invoke');
      expect(error.message).to.eql('Not found');
      expect(error.path).to.eql('A1');
      expect(error.formula).to.eql('=SUM(1,2)');
    });
  });

  describe('binary-expression', () => {
    it('=1+2+3', async () => {
      const ctx = await testContext({
        A1: { value: '=1+2+3' },
      });

      const res = await one<number>({ cell: 'A1', ...ctx });

      expect(res.ok).to.eql(true);
      expect(res.type).to.eql('FUNC');
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
      const res = await one<number>({ cell: 'A1', ...ctx });
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
        const res = await one<number>({ cell, ...ctx });
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
      const res = await one<number>({ cell: 'A1', ...ctx });
      expect(res.data).to.eql(10);
    });
  });

  describe('async', () => {
    it('returns result from async func ', async () => {
      const ctx = await testContext(
        {
          A1: { value: '=1+A2' },
          A2: { value: 4 },
        },
        { delay: 10 },
      );
      const wait = one<number>({ cell: 'A1', ...ctx });
      const res = await wait;
      expect(res.data).to.eql(5);
    });
  });
});
