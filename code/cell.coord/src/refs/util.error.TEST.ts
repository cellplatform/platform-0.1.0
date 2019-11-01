import { coord } from '..';
import { expect, testContext } from './TEST';
import * as util from './util.error';

describe('refs.util (error)', () => {
  describe('getCircularErrors', () => {
    it('no errors', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '123' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });
      const table = coord.refs.table(ctx);
      const refs = await table.refs();

      const res1 = util.getCircularErrors(refs, 'A1');
      const res2 = util.getCircularErrors(refs);
      expect(res1).to.eql([]);
      expect(res2).to.eql([]);
    });

    it('narrow on single key', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A1' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });
      const table = coord.refs.table(ctx);
      const refs = await table.refs();

      const res1 = util.getCircularErrors(refs, 'A1');
      const res2 = util.getCircularErrors(refs, 'A2');
      const res3 = util.getCircularErrors(refs, 'A3');
      const res4 = util.getCircularErrors(refs, 'A4');

      expect(res1.length).to.eql(1);
      expect(res2.length).to.eql(1);
      expect(res3.length).to.eql(2);
      expect(res4.length).to.eql(0);

      expect(res1[0].path).to.eql('A1/A2/A1');
      expect(res2[0].path).to.eql('A2/A1/A2');

      expect(res3[0].path).to.eql('A3/A1/A2/A1');
      expect(res3[1].path).to.eql('A3/A2/A1/A2');
    });

    it('narrow on several keys keys', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A1' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });
      const table = coord.refs.table(ctx);
      const refs = await table.refs();
      const res = util.getCircularErrors(refs, ['A1', 'A3']);
      expect(res.length).to.eql(3);
      expect(res[0].path).to.eql('A1/A2/A1');
      expect(res[1].path).to.eql('A3/A1/A2/A1');
      expect(res[2].path).to.eql('A3/A2/A1/A2');
    });

    it('across all keys', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A1' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });
      const table = coord.refs.table(ctx);
      const refs = await table.refs();
      const res = util.getCircularErrors(refs);
      expect(res.length).to.eql(4);
      expect(res[0].path).to.eql('A1/A2/A1');
      expect(res[1].path).to.eql('A2/A1/A2');
      expect(res[2].path).to.eql('A3/A1/A2/A1');
      expect(res[3].path).to.eql('A3/A2/A1/A2');
    });
  });

  describe('hasCircularError', () => {
    it('true', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A1' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });

      const table = coord.refs.table(ctx);
      const refs = await table.refs();
      const res1 = util.hasCircularError(refs, 'A1');
      const res2 = util.hasCircularError(refs);
      const res3 = util.hasCircularError(refs, ['A4', 'A1']);

      expect(res1).to.eql(true);
      expect(res2).to.eql(true);
      expect(res3).to.eql(true);
    });

    it('false', async () => {
      const ctx = testContext({
        A1: { value: '=A2' },
        A2: { value: '=A1' },
        A3: { value: '=SUM(A1, A2)' },
        A4: { value: 'abc' },
      });

      const table = coord.refs.table(ctx);
      const refs = await table.refs();
      const res1 = util.hasCircularError(refs, 'A4');
      const res2 = util.hasCircularError(refs, ['Z9']);
      const res3 = util.hasCircularError(refs, []);

      expect(res1).to.eql(false);
      expect(res2).to.eql(false);
      expect(res3).to.eql(false);
    });
  });
});
