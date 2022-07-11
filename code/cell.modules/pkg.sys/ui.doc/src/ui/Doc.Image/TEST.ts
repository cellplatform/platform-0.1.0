import { Test, expect } from '../../test';
import { DocImage } from '.';

export default Test.describe.only('Doc.Image', (e) => {
  e.describe('aspect ratio', (e) => {
    const { AspectRatio } = DocImage;

    e.it('toString', () => {
      const test = (x: number, y: number, expected: string) => {
        const res = AspectRatio.toString(x, y);
        expect(res).to.eql(expected);
      };
      test(2880, 1440, '2:1');
      test(640, 480, '4:3');
    });

    e.it('parse', () => {
      const test = (input: string, x: number, y: number) => {
        const res = AspectRatio.parse(input);
        expect(res.x).to.eql(x);
        expect(res.y).to.eql(y);
        expect(res.toString()).to.eql(`${x}:${y}`);
      };

      test('4:3', 4, 3);
      test('  4:3  ', 4, 3);
      test('  4  :  3  ', 4, 3);
    });

    e.it('parse: error', () => {
      const test = (input: any, ...errors: string[]) => {
        const res = AspectRatio.parse(input);
        expect(res.x).to.eql(-1);
        expect(res.y).to.eql(-1);
        expect(res.toString()).to.eql('-1:-1');
        expect(res.error).to.include('Failed to parse aspect ratio');
        if (errors.length > 0) {
          errors.forEach((message) => expect(res.error).to.include(message));
        }
      };

      test(null, 'Input is not a string.');
      test(undefined, 'Input is not a string.');
      test([], 'Input is not a string.');
      test({}, 'Input is not a string.');
      test(123, 'Input is not a string.');
      test(true, 'Input is not a string.');

      test('', 'does not contain a colon, eg. "2:1"');
      test('  ', 'does not contain a colon, eg. "2:1"');
      test('123', 'does not contain a colon, eg. "2:1"');

      test('1:2:3', 'contains too many colons');
      test(' 1 : 2 : 3 ', 'contains too many colons');

      test('a:1', 'The [x] value', 'not a number');
      test('1:b', 'The [y] value', 'not a number');
    });

    e.it('calculate width/height', () => {
      const ratio = AspectRatio.toObject(4, 3);
      expect(ratio.width(480)).to.eql(640);
      expect(ratio.height(640)).to.eql(480);
    });
  });
});
