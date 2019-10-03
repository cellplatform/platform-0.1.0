import { expect, testContext } from './TEST';
import { refs } from '.';
import { t, MemoryCache } from '../common';

const outgoing = (args: refs.IOutgoingArgs) => {
  return refs.outgoing(args);
};

describe('refs.outgoing', () => {
  it('undefined (not a formula)', async () => {
    const ctx = testContext({
      A2: { value: 123 },
    });
    const res = await outgoing({ key: 'A2', ...ctx });
    expect(res).to.eql([]);
  });

  describe('REF', () => {
    it('A1 => A2', async () => {
      const ctx = testContext({
        A1: { value: '=A$2' },
        A2: { value: 123 },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('VALUE');
      expect(res[0].path).to.eql('A1/A2');
      expect(res[0].param).to.eql(undefined);
    });

    it('A1 => A2 => A3', async () => {
      const ctx = testContext({
        A1: { value: '=A$2' },
        A2: { value: '=$A3' },
        A3: { value: 123 },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('VALUE');
      expect(res[0].path).to.eql('A1/A2/A3');
    });

    it('A1 => A1 (ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=A1' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });
      const error = res[0].error as t.IRefError;

      expect(res.length).to.eql(1);
      expect(res[0].path).to.eql('A1/A1');
      expect(error.type).to.eql('CIRCULAR');
    });

    it('A1 => A2 => A3 => A1 (ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A3' },
        A3: { value: '=A1' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });
      const error = res[0].error as t.IRefError;

      expect(res.length).to.eql(1);
      expect(res[0].path).to.eql('A1/A2/A3/A1');
      expect(error.type).to.eql('CIRCULAR');
    });

    it('A1 => B (ERROR/NAME)', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=B' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });
      const error = res[0].error as t.IRefError;

      expect(res.length).to.eql(1);
      expect(res[0].path).to.eql('A1/A2/B');
      expect(res[0].target).to.eql('UNKNOWN');

      expect(error.type).to.eql('NAME');
      expect(error.message).to.include('Unknown range: B');
    });

    it('A1 => A2 (FUNC)', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=SUM(A3,999)' },
        A3: { value: 3 },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('FUNC');
      expect(res[0].path).to.eql('A1/A2');
    });
  });

  describe('FUNC', () => {
    it('=SUM(A2, 10, A3)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(A2, 10, A3)' },
        A2: { value: 123 },
        A3: { value: '=A4' },
        A4: { value: 456 },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(2);

      expect(res[0].target).to.eql('VALUE');
      expect(res[0].param).to.eql('0');
      expect(res[0].path).to.eql('A1/A2');

      expect(res[1].target).to.eql('VALUE');
      expect(res[1].param).to.eql('2');
      expect(res[1].path).to.eql('A1/A3/A4');
    });

    it('params to types: =SUM(..) => FUNC | VALUE | RANGE | FUNC', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(999, A2, A3, A3:A4, A5)' },
        A2: { value: '=SUM(A3, 999)' },
        A3: { value: '1' },
        A4: { value: 2 },
        A5: { value: '=A4+2' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(4);

      expect(res[0].target).to.eql('FUNC');
      expect(res[0].path).to.eql('A1/A2');
      expect(res[0].param).to.eql('1');

      expect(res[1].target).to.eql('VALUE');
      expect(res[1].path).to.eql('A1/A3');
      expect(res[1].param).to.eql('2');

      expect(res[2].target).to.eql('RANGE');
      expect(res[2].path).to.eql('A1/A3:A4');
      expect(res[2].param).to.eql('3');

      expect(res[3].target).to.eql('FUNC');
      expect(res[3].path).to.eql('A1/A5');
      expect(res[3].param).to.eql('4');
    });

    describe('circular error', () => {
      it('error: param to RANGE', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, A2, A3)' },
          A2: { value: 123 },
          A3: { value: '=A1:B9' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(2);

        expect(res[1].target).to.eql('RANGE');
        expect(res[1].path).to.eql('A1/A3/A1:B9');
        expect(res[1].param).to.eql('2');

        const error = res[1].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
      });

      it('error: param to RANGE (direct)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, A1:B9)' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);

        expect(res[0].target).to.eql('RANGE');
        expect(res[0].path).to.eql('A1/A1:B9');
        expect(res[0].param).to.eql('1');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A1:B9');
      });

      it('error: param => RANGE (indirect)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, B1:B9)' },
          B3: { value: '=C1' },
          C1: { value: '=A1' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        const error = res[0].error as t.IRefError;

        expect(res.length).to.eql(1);
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/B1:B9');
        expect(error.message).to.include('Range contains a cell that leads back to itself');
      });

      it('error: param => RANGE => RANGE (indirect)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, B1:B9)' },
          B3: { value: '=C1:C9' },
          C5: { value: '=A1' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        const error = res[0].error as t.IRefError;

        expect(res.length).to.eql(1);
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/B1:B9');
        expect(error.message).to.include('Range contains a cell that leads back to itself');
      });

      it('error: param => RANGE => expr => RANGE (indirect)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, 4 + (3 + B1:B9))' },
          B3: { value: '=C1:C9' },
          C5: { value: '=A1' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        const error = res[0].error as t.IRefError;

        expect(res.length).to.eql(1);
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/B1:B9');
        expect(error.message).to.include('Range contains a cell that leads back to itself');
      });

      it('error: FUNC param => self (direct)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, A1)' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res[0].target).to.eql('FUNC');
        expect(res[0].path).to.eql('A1/A1');
        expect(res[0].param).to.eql('1');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A1');
      });

      it('error: FUNC => FUNC', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, A2)' },
          A2: { value: '=SUM(A1, 888)' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        expect(res[0].target).to.eql('FUNC');
        expect(res[0].path).to.eql('A1/A2');
        expect(res[0].param).to.eql('1');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A2/A1');
      });

      it('error: FUNC => REF => FUNC', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(999, A2)' },
          A2: { value: '=A3' },
          A3: { value: '=SUM(999, A1)' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res[0].target).to.eql('FUNC');
        expect(res[0].path).to.eql('A1/A2/A3');
        expect(res[0].param).to.eql('1');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A2/A3/A1');
      });
    });
  });

  describe('FUNC (binary expression)', () => {
    it('=A4 + A2 / (8 + A3 - A5 * 2 +A2)', async () => {
      const ctx = testContext({
        A1: { value: '=A4 + A2 / (8 + A3 - A5 * 2 +A2)' },
        A2: { value: 1 },
        A3: { value: '=A4' },
        A4: { value: 2 },
        A5: { value: '=SUM(1, 99)' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(5);

      expect(res[0].target).to.eql('VALUE');
      expect(res[1].target).to.eql('VALUE');
      expect(res[2].target).to.eql('VALUE');
      expect(res[3].target).to.eql('FUNC');
      expect(res[4].target).to.eql('VALUE');

      expect(res[0].path).to.eql('A1/A4');
      expect(res[1].path).to.eql('A1/A2');
      expect(res[2].path).to.eql('A1/A3/A4');
      expect(res[3].path).to.eql('A1/A5');
      expect(res[4].path).to.eql('A1/A2');

      expect(res[0].param).to.eql('0');
      expect(res[1].param).to.eql('1');
      expect(res[2].param).to.eql('3');
      expect(res[3].param).to.eql('4');
      expect(res[4].param).to.eql('6');
    });

    it('=5 + SUM(A2,A3)  |  FUNC with two out-bound refs)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + SUM(A2,A3,999,A5) + A3' },
        A2: { value: 2 },
        A3: { value: '=A4' },
        A4: { value: 4 },
        A5: { value: '=SUM(1,A2)' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(4);
      expect(res[0].target).to.eql('VALUE');
      expect(res[1].target).to.eql('VALUE');
      expect(res[2].target).to.eql('FUNC');
      expect(res[3].target).to.eql('VALUE');

      expect(res[0].param).to.eql('1/0');
      expect(res[1].param).to.eql('1/1');
      expect(res[2].param).to.eql('1/3');
      expect(res[3].param).to.eql('2');

      expect(res[0].path).to.eql('A1/A2');
      expect(res[1].path).to.eql('A1/A3/A4');
      expect(res[2].path).to.eql('A1/A5');
      expect(res[3].path).to.eql('A1/A3/A4');
    });

    it('deep wrapping (1)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + SUM(A2,A3 + A5)' },
        A2: { value: 2 },
        A3: { value: '=A4' },
        A4: { value: 4 },
        A5: { value: '=SUM(1,A2)' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(3);
      expect(res[0].target).to.eql('VALUE');
      expect(res[1].target).to.eql('VALUE');
      expect(res[2].target).to.eql('FUNC');

      expect(res[0].param).to.eql('1/0');
      expect(res[1].param).to.eql('1/1/0');
      expect(res[2].param).to.eql('1/1/1');

      expect(res[0].path).to.eql('A1/A2');
      expect(res[1].path).to.eql('A1/A3/A4');
      expect(res[2].path).to.eql('A1/A5');
    });

    it('deep wrapping of expr/func (2)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + SUM(123, A3 + 999 + A5, A2) + A5' },
        A2: { value: 2 },
        A3: { value: '=A4' },
        A4: { value: 4 },
        A5: { value: '=SUM(1,2)' },
        A6: { value: '=SUM(1, SUM(1,A2))' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(4);
      expect(res[0].target).to.eql('VALUE');
      expect(res[1].target).to.eql('FUNC');
      expect(res[2].target).to.eql('VALUE');
      expect(res[3].target).to.eql('FUNC');

      expect(res[0].param).to.eql('1/1/0');
      expect(res[1].param).to.eql('1/1/2');
      expect(res[2].param).to.eql('1/2');
      expect(res[3].param).to.eql('2');

      expect(res[0].path).to.eql('A1/A3/A4');
      expect(res[1].path).to.eql('A1/A5');
      expect(res[2].path).to.eql('A1/A2');
      expect(res[3].path).to.eql('A1/A5');
    });

    it('deep wrapping of expr => REF (3)', async () => {
      const ctx = testContext({
        A1: { value: '=1 + (1 + (1 + Z9))' },
        Z9: { value: 10 },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('VALUE');
      expect(res[0].param).to.eql('3');
      expect(res[0].path).to.eql('A1/Z9');
    });

    it('deep wrapping of func/func => REF (3)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(1, SUM(1,2,Z9,3,Z9))' },
        A2: { value: '=SUM(1, SUM(1,SUM(1,SUM(Z9,999,Z9))))' },
        A3: { value: '=SUM(1, 5+Z10+SUM(1,Z9,2))' },
        Z9: { value: 10 },
        Z10: { value: '=Z9' },
      });

      const test = async (key: string, paths: string[], params: string[]) => {
        const res = await outgoing({ key, ...ctx });
        paths.forEach((path, i) => expect(res[i].path).to.eql(path));
        params.forEach((param, i) => expect(res[i].param).to.eql(param));
      };

      await test('A1', ['A1/Z9', 'A1/Z9'], ['1/2', '1/4']);
      await test('A2', ['A2/Z9', 'A2/Z9'], ['1/1/1/0', '1/1/1/2']);
      await test('A3', ['A3/Z10/Z9', 'A3/Z9'], ['1/1', '1/2/1']);
    });

    it('=5 + A1:B9  |  (RANGE => self)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + B1:B9' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/B1:B9');
      expect(res[0].param).to.eql('1');
    });

    it('=1+2  |  no refs', async () => {
      const test = async (expr: string) => {
        const ctx = testContext({
          A1: { value: expr },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        expect(res).to.eql([]);
      };

      await test('1+2');
      await test('=1+2');
      await test('=1   +2');
      await test('=1+ 2');

      await test('1-2');
      await test('=1-2');
      await test('=1   -2');
      await test('=1- 2');
    });

    describe('circular error', () => {
      it('error: =5 + A1:B9 (RANGE)', async () => {
        const ctx = testContext({
          A1: { value: '=5 + A1:B9' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        const error = res[0].error as t.IRefError;

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('RANGE');
        expect(res[0].path).to.eql('A1/A1:B9');
        expect(res[0].param).to.eql('1');

        expect(error.type).to.eql('CIRCULAR');
      });

      it('error: =5 + A1:B9 (RANGE => RANGE)', async () => {
        const ctx = testContext({
          A1: { value: '=5 + B1:B9' },
          B2: { value: '=C1:C9' },
          C3: { value: '=A1' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });
        const error = res[0].error as t.IRefError;

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('RANGE');
        expect(res[0].path).to.eql('A1/B1:B9');
        expect(res[0].param).to.eql('1');

        expect(error.type).to.eql('CIRCULAR');
      });

      it('error: =A1+5 => self (direct)', async () => {
        const ctx = testContext({
          A1: { value: '=A1+5' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('FUNC');
        expect(res[0].path).to.eql('A1');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
      });

      it('error: =A2+5 => REF => self ', async () => {
        const ctx = testContext({
          A1: { value: '=A2 + 5' },
          A2: { value: '=A1' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('REF');
        expect(res[0].path).to.eql('A1/A2');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A2/A1');
      });

      it('error: =A2+1 => FUNC => self ', async () => {
        const ctx = testContext({
          A1: { value: '=A2 + 1' },
          A2: { value: '=SUM(A1, A1)' },
        });

        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('FUNC');
        expect(res[0].path).to.eql('A1/A2');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.path).to.eql('A1/A2/A1');
      });

      it('error: deep wrapping (embedded func)', async () => {
        const ctx = testContext({
          A1: { value: '=5 + SUM(A2,A3 + A5)' },
          A2: { value: 2 },
          A3: { value: '=A1' },
          A4: { value: 4 },
          A5: { value: '=SUM(1,A1)' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        const error1 = res[0].error as t.IRefError;
        const error2 = res[1].error as t.IRefError;
        const error3 = res[2].error as t.IRefError;

        expect(res.length).to.eql(3);

        expect(res[0].target).to.eql('VALUE');
        expect(res[1].target).to.eql('REF');
        expect(res[2].target).to.eql('FUNC');

        expect(res[0].path).to.eql('A1/A2');
        expect(res[1].path).to.eql('A1/A3');
        expect(res[2].path).to.eql('A1/A5');

        expect(res[0].param).to.eql('1/0');
        expect(res[1].param).to.eql('1/1/0');
        expect(res[2].param).to.eql('1/1/1');

        expect(error1).to.eql(undefined);
        expect(error2.type).to.eql('CIRCULAR');
        expect(error3.type).to.eql('CIRCULAR');

        expect(error2.path).to.eql('A1/A3/A1');
        expect(error3.path).to.eql('A1/A5/A1');
      });

      it('error: deep wrapping (embedded expression)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(A2,A3 + A5)' },
          A2: { value: 2 },
          A3: { value: '=A1' },
          A4: { value: 4 },
          A5: { value: '=SUM(1,A1)' },
          A6: { value: '=SUM(1, SUM(1,SUM(1,SUM(999,A1))))' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        const error1 = res[0].error as t.IRefError;
        const error2 = res[1].error as t.IRefError;
        const error3 = res[2].error as t.IRefError;

        expect(res.length).to.eql(3);

        expect(res[0].target).to.eql('VALUE');
        expect(res[1].target).to.eql('REF');
        expect(res[2].target).to.eql('FUNC');

        expect(res[0].path).to.eql('A1/A2');
        expect(res[1].path).to.eql('A1/A3');
        expect(res[2].path).to.eql('A1/A5');

        expect(res[0].param).to.eql('0');
        expect(res[1].param).to.eql('1/0');
        expect(res[2].param).to.eql('1/1');

        expect(error1).to.eql(undefined);
        expect(error2.type).to.eql('CIRCULAR');
        expect(error3.type).to.eql('CIRCULAR');

        expect(error2.path).to.eql('A1/A3/A1');
        expect(error3.path).to.eql('A1/A5/A1');
      });

      it('error: deep wrapping (embedded func)', async () => {
        const ctx = testContext({
          A1: { value: '=SUM(1, SUM(1,SUM(1,SUM(999,A1))))' },
          A2: { value: '=SUM(1, SUM(1,SUM(1,SUM(Z9,999))))' },
          A3: { value: '=SUM(1, 5+Z9+SUM(1,2))' },
          Z9: { value: '=A2' },
        });

        const test = async (key: string, param: string, errorPath: string) => {
          const res = await outgoing({ key, ...ctx });
          expect(res.length).to.eql(1);
          expect(res[0].param).to.eql(param);
          expect((res[0].error as t.IRefError).path).to.eql(errorPath);
        };

        await test('A1', '1/1/1/1', 'A1/A1');
        await test('A2', '1/1/1/0', 'A2/Z9/A2');
        await test('A3', '1/1', 'A3/Z9/A2/Z9');
      });
    });
  });

  describe('RANGE', () => {
    it('=B1:B9', async () => {
      const ctx = testContext({
        A1: { value: '=$B1:B$9' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });
      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/B1:B9');
      expect(res[0].error).to.eql(undefined);
    });

    it('A1 => B1:B9', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=$B1:B$9' },
      });
      const res = await outgoing({ key: 'A1', ...ctx });
      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/A2/B1:B9');
      expect(res[0].error).to.eql(undefined);
    });

    describe('circular error', () => {
      it('error: direct (self)', async () => {
        const ctx = testContext({
          A1: { value: '=A1:B9' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('RANGE');
        expect(res[0].path).to.eql('A1/A1:B9');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.message).to.include(
          'Range contains a cell that leads back to itself (A1/A1:B9)',
        );
      });

      it('error: indirect', async () => {
        const ctx = testContext({
          A1: { value: '=B$2' },
          B2: { value: '=A1:B$9' },
        });
        const res = await outgoing({ key: 'A1', ...ctx });

        expect(res.length).to.eql(1);
        expect(res[0].target).to.eql('RANGE');
        expect(res[0].path).to.eql('A1/B2/A1:B9');

        const error = res[0].error as t.IRefError;
        expect(error.type).to.eql('CIRCULAR');
        expect(error.message).to.include(
          'Range contains a cell that leads back to itself (A1/B2/A1:B9)',
        );
      });
    });
  });

  describe('cache', () => {
    it('uses memory cache', async () => {
      const cache = MemoryCache.create();
      const ctx = testContext({
        A1: { value: '=A4 + A2 / (8 + A3 - A5 * 2 +A2)' },
        A2: { value: 1 },
        A3: { value: '=A4' },
        A4: { value: 2 },
        A5: { value: '=SUM(1, 99)' },
      });
      const res1 = await outgoing({ key: 'A1', ...ctx });
      const res2 = await outgoing({ key: 'A1', ...ctx, cache });
      const res3 = await outgoing({ key: 'A1', ...ctx, cache });

      // Cached instance comparison.
      expect(res1).to.not.equal(res2);
      expect(res2).to.equal(res3); // NB: Cached.

      // Cached value comparison.
      expect(res1).to.eql(res2);
      expect(res2).to.eql(res3);
    });
  });
});
