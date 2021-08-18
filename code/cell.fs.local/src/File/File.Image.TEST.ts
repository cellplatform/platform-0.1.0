import { File } from '.';
import { expect, expectError, TestUtil } from '../test';

const fs = TestUtil.node;

describe.only('FileImage', () => {
  describe('FileImage.size', () => {
    it('properties: width, height, orientation, type', async () => {
      const test = async (path: string, width: number, height: number) => {
        const res = await File.Image.size(path);
        expect(res?.width).to.eql(width);
        expect(res?.height).to.eql(height);
      };

      await test('static.test/images/hand.jpg', 81, 81);
      await test('static.test/favicon.ico', 16, 16);
      await test('static.test/images/bird.png', 272, 226);
      await test('static.test/images/award.svg', 24, 24);
    });

    it('throw: file does not exist', async () => {
      await expectError(() => File.Image.size('does/not/exist'), `no such file or directory`);
    });

    it('throw: file type not supported', async () => {
      await expectError(() => File.Image.size('static.test/file.txt'), `unsupported file type`);
    });

    it('throw: binary not an image, but named with an image extension', async () => {
      await TestUtil.reset();

      const binary = {
        image: await fs.readFile(fs.resolve('static.test/images/bird.png')),
        text: await fs.readFile(fs.resolve('static.test/file.txt')),
      };
      const path = {
        image: fs.resolve('tmp/image.png'),
        textAsImage: fs.resolve('tmp/text-as-image.png'),
      };
      await TestUtil.writeFile(path.image, binary.image);
      await TestUtil.writeFile(path.textAsImage, binary.text);

      // Works: is actually an image.
      const res = await File.Image.size(path.image);
      expect(res?.type).to.eql('png');
      expect(typeof res?.height === 'number').to.eql(true);

      // Fails: is non-image file masquerading as an image.
      await expectError(() => File.Image.size(path.textAsImage), `unsupported file type`);
    });
  });

  describe('FileImage.manifestFileImage', () => {
    it('File.Image.manifestFileImage', async () => {
      const path = fs.resolve('static.test/images/bird.png');
      const res = await File.Image.manifestFileImage(fs, path);
      expect(res?.kind).to.eql('png');
      expect(res?.width).to.eql(272);
      expect(res?.height).to.eql(226);
    });
  });
});
