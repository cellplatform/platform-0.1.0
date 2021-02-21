import { sizeOfImage } from '.';
import { expect, expectError } from '../../test';

describe('util.image', () => {
  describe('sizeOfImage', () => {
    it('calculates size', async () => {
      const test = async (path: string, width: number, height: number) => {
        const res = await sizeOfImage(path);
        expect(res?.width).to.eql(width);
        expect(res?.height).to.eql(height);
      };

      await test('static/images/hand.jpg', 81, 81);
      await test('static/favicon.ico', 16, 16);
      await test('static/images/wax@2x.png', 492, 490);
      await test('static/images/award.svg', 24, 24);
    });

    it('throw: file does not exist', async () => {
      await expectError(() => sizeOfImage('does/not/exist'), `no such file or directory`);
    });

    it('throw: file type not supported', async () => {
      await expectError(() => sizeOfImage('static/file.txt'), `unsupported file type`);
    });
  });
});
