import { expect } from '../test';
import { util } from '.';

describe('util', () => {
  it('toMimetype', () => {
    const test = (input: any, expected?: string) => {
      const res = util.toMimetype(input);
      expect(res).to.eql(expected);
    };

    test('image.png', 'image/png');
    test('image.jpg', 'image/jpeg');
    test('doc.pdf', 'application/pdf');

    test('', undefined);
    test('  ', undefined);
    test(undefined, undefined);
  });
});
