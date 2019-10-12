import { expect, expectError } from '@platform/test';
import { sys } from '.';

const getSysFunc = async (name: string) => sys.getFunc({ namespace: 'sys', name });

const test = async (name: string, params: any, expected?: number) => {
  const func = await getSysFunc(name);
  expect(func).to.be.an.instanceof(Function);
  if (func) {
    expect(await func({ params })).to.eql(expected);
  }
};

describe('func.sys', () => {
  describe('sys.arithmetic', () => {
    it('SUM', async () => {
      await test('SUM', [], 0);
      await test('SUM', [[], 0, []], 0);
      await test('SUM', [1, undefined, 2], 3);
      await test('SUM', [[1, undefined, 2], 3], 6);
    });

    it('SUBTRACT', async () => {
      await test('SUBTRACT', [], undefined);
      await test('SUBTRACT', [10, 5], 5);
      await test('SUBTRACT', [10, 5, 8], -3);
      await test('SUBTRACT', [[10, 5], 2], 3);
    });

    it('MULTIPLY', async () => {
      await test('MULTIPLY', [], undefined);
      await test('MULTIPLY', [1, 1], 1);
      await test('MULTIPLY', [1, 2], 2);
      await test('MULTIPLY', [2, 4], 8);
    });

    it('DIVIDE', async () => {
      await test('DIVIDE', [], undefined);
      await test('DIVIDE', [10, 2], 5);
      await test('DIVIDE', [[20, 2], 2], 5);
      await expectError(async () => {
        await test('DIVIDE', [3, 0], 5);
      });
    });

    it.skip('>', async () => {
      //
    });
    it.skip('>=', async () => {
      //
    });
    it.skip('<', async () => {
      //
    });
    it.skip('<=', async () => {
      //
    });
    it.skip('&', async () => {
      //
    });
    it.skip('=', async () => {
      //
    });
  });

  describe('sys.stats', () => {
    it.skip('AVERAGE (AVG)', async () => {
      //
    });
  });
});
