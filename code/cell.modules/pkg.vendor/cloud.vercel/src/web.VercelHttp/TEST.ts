import { expect, Test, TestUtil } from '../web.test';
import { Util } from './common';

export default Test.describe('VercelHttp', async (e) => {
  const fs = await TestUtil.fs.init();

  e.describe('util', (e) => {
    e.describe('shasum (SHA1 digest)', (e) => {
      e.it('hash: <empty> (undefined input)', () => {
        expect(Util.shasum()).to.eql('');
      });

      e.it('hash: string', () => {
        const res = Util.shasum('hello');
        expect(res).to.eql('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
      });

      e.it('hash: Uint8Array', async () => {
        const path = 'VercelHttp/sample.dat';
        const data = { foo: 123 };

        await fs.write(path, data);
        const file = await fs.read(path);

        const res = Util.shasum(file);
        expect(res).to.eql('be56893d6faa9d742f1595f8d077af6083ba8dd6');
      });
    });
  });
});
