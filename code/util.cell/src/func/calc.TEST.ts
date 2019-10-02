import { expect, testContext } from './TEST';
import { func } from '.';

describe.only('func.calculate', () => {
  describe('binary-expression', () => {
    it('=1+2+3', async () => {
      const ctx = await testContext({
        A1: { value: '=1+2+3' },
      });

      const res = await func.calculate<number>({ key: 'A1', ...ctx });

      console.log('-------------------------------------------');
      console.log('res', res);

      expect(res.ok).to.eql(true);
      expect(res.cell).to.eql('A1');
      expect(res.formula).to.eql('=1+2+3');
      expect(res.data).to.eql(6);
    });
  });
});
