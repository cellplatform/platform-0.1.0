import { expect, fs } from '../test';
import { hash } from '.';

describe('hash', () => {
  it('sha256', async () => {
    const buffer = await fs.readFile(fs.resolve('src/test/images/kitten.jpg'));

    const test = (input: any, expected: string) => {
      const res = hash.sha256(input);
      // console.log(res.substring(res.length - 10));

      expect(res).to.match(/^sha256-/);
      expect(res).to.match(new RegExp(`${expected}$`));
    };

    test(123, 'f7f7a27ae3');
    test({ msg: 'abc' }, '43991ca7b7');
    test(buffer, 'b6a89e9e8f');
  });
});
