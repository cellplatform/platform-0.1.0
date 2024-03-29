import { Stream } from '.';
import { expect, stringify, t } from '../test';

describe.skip('ReadStream (web)', () => {
  describe.skip('read (Uint8Array)', () => {
    it('json', async () => {
      const test = async (input: t.Json) => {
        const res = await Stream.toUint8Array(input);
        const text = new TextDecoder().decode(res);
        expect(text).to.eql(stringify(input));
      };
      await test(undefined);
      await test(null);
      await test('hello');
      await test(1234);
      await test(true);
      await test([1, 2, 3]);
      await test({ foo: 123 });
    });
  });
});
