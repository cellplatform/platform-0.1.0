import { expect } from '../../test';
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

  it('toSeconds', () => {
    const test = (input: string | number | undefined, expected?: number) => {
      const res = util.toSeconds(input);
      expect(res).to.eql(expected);
    };

    test(undefined, undefined);
    test(-1, undefined);
    test(-0.0001, undefined);

    test(0, 0);
    test(10, 10);
    test('1000ms', 1);

    test('1m', 60);
    test('1 m', 60);
    test('1h', 3600);
  });
});
