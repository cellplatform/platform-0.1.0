import { expect } from 'chai';

import { refs } from '.';
import { t } from '../../common';

const testContext = (cells: t.IGridCells): t.IRefContext => {
  return {
    getCell: async (key: string) => cells[key],
  };
};

describe('refs.outgoing', () => {
  it('undefined (not a formula)', async () => {
    const ctx = testContext({
      A2: { value: 123 },
    });
    const res = await refs.outgoing({ key: 'A2', ctx });
    expect(res).to.eql([]);
  });

  describe('REF', () => {
    it('A1 => A2', async () => {
      const ctx = testContext({
        A1: { value: '=A$2' },
        A2: { value: 123 },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });
      const ref = res[0] as t.IRefOut;

      expect(res.length).to.eql(1);
      expect(ref.target).to.eql('VALUE');
      expect(ref.path).to.eql('A1/A2');
      expect(ref.param).to.eql(undefined);

      console.log('res', res);
    });

    it('A1 => A2 => A3', async () => {
      const ctx = testContext({
        A1: { value: '=A$2' },
        A2: { value: '=$A3' },
        A3: { value: 123 },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });
      const ref = res[0] as t.IRefOut;

      expect(res.length).to.eql(1);
      expect(ref.target).to.eql('VALUE');
      expect(ref.path).to.eql('A1/A2/A3');
    });

    it('A1 => A1 (ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=A1' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });
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
      const res = await refs.outgoing({ key: 'A1', ctx });
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
      const res = await refs.outgoing({ key: 'A1', ctx });
      const error = res[0].error as t.IRefError;

      expect(res.length).to.eql(1);
      expect(res[0].path).to.eql('A1/A2/B');
      expect(res[0].target).to.eql('UNKNOWN');

      expect(error.type).to.eql('NAME');
      expect(error.message).to.include('Unknown range: B');
    });

    it('A1 => A2(func)', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=SUM(1,2,3)' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

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
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(2);

      expect(res[0].target).to.eql('VALUE');
      expect(res[0].param).to.eql(0);
      expect(res[0].path).to.eql('A1/A2');

      expect(res[1].target).to.eql('VALUE');
      expect(res[1].param).to.eql(2);
      expect(res[1].path).to.eql('A1/A3/A4');
    });

    it('params to types: =SUM(..) => FUNC | VALUE | RANGE | FUNC', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(999, A2, A3, A3:A4, A5)' },
        A2: { value: '=SUM(A3, 999)' },
        A3: { value: 1 },
        A4: { value: 2 },
        A5: { value: '=A4+2' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(4);

      expect(res[0].target).to.eql('FUNC');
      expect(res[0].path).to.eql('A1/A2');
      expect(res[0].param).to.eql(1);

      expect(res[1].target).to.eql('VALUE');
      expect(res[1].path).to.eql('A1/A3');
      expect(res[1].param).to.eql(2);

      expect(res[2].target).to.eql('RANGE');
      expect(res[2].path).to.eql('A1/A3:A4');
      expect(res[2].param).to.eql(3);

      expect(res[3].target).to.eql('FUNC');
      expect(res[3].path).to.eql('A1/A5');
      expect(res[3].param).to.eql(4);
    });

    it('param to range (ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(999, A2, A3)' },
        A2: { value: 123 },
        A3: { value: '=A1:B9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(2);

      expect(res[1].target).to.eql('RANGE');
      expect(res[1].path).to.eql('A1/A3/A1:B9');
      expect(res[1].param).to.eql(2);

      const error = res[1].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
    });

    it('param to range (immediate ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=SUM(999, A1:B9)' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);

      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/A1:B9');
      expect(res[0].param).to.eql(1);

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
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
      const res = await refs.outgoing({ key: 'A1', ctx });

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

      expect(res[0].param).to.eql(0);
      expect(res[1].param).to.eql(1);
      expect(res[2].param).to.eql(3);
      expect(res[3].param).to.eql(4);
      expect(res[4].param).to.eql(6);
    });

    it('=5 + A1:B9 (range)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + B1:B9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/B1:B9');
      expect(res[0].param).to.eql(1);
    });

    it('=1+2 (no refs)', async () => {
      const test = async (expr: string) => {
        const ctx = testContext({
          A1: { value: expr },
        });
        const res = await refs.outgoing({ key: 'A1', ctx });
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

    it('=5 + A1:B9 (RANGE, ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=5 + A1:B9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/A1:B9');

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
    });

    it('=A1+5 (immediate ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=A1+5' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('VALUE');
      expect(res[0].path).to.eql('A1/A1');

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
    });

    it('=A2 + 5 => A1 (ERROR/CIRCULAR)', async () => {
      const ctx = testContext({
        A1: { value: '=A2 + 5' },
        A2: { value: '=A1' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('VALUE');
      expect(res[0].path).to.eql('A1/A2/A1');

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
    });
  });

  describe('RANGE', () => {
    it('A1 => B1:B9', async () => {
      const ctx = testContext({
        A1: { value: '=$B1:B$9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });
      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/B1:B9');
      expect(res[0].error).to.eql(undefined);
    });

    it('ERROR/CIRCULAR', async () => {
      const ctx = testContext({
        A1: { value: '=B$2' },
        B2: { value: '=A1:B$9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/B2/A1:B9');

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
      expect(error.message).to.include(
        'Range contains a cell that leads back to itself. (A1/B2/A1:B9)',
      );
    });

    it('ERROR/CIRCULAR (immediate)', async () => {
      const ctx = testContext({
        A1: { value: '=A1:B9' },
      });
      const res = await refs.outgoing({ key: 'A1', ctx });

      expect(res.length).to.eql(1);
      expect(res[0].target).to.eql('RANGE');
      expect(res[0].path).to.eql('A1/A1:B9');

      const error = res[0].error as t.IRefError;
      expect(error.type).to.eql('CIRCULAR');
      expect(error.message).to.include(
        'Range contains a cell that leads back to itself. (A1/A1:B9)',
      );
    });
  });
});
