import { File } from '.';
import { expect, expectError, util } from '../test';

const fs = util.node;

describe('FileImage', () => {
  it('FileImage.size (width, height, orientation, type)', async () => {
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

  it('File.Image.manifestFileImage', async () => {
    const path = fs.resolve('static.test/images/bird.png');
    const res = await File.Image.manifestFileImage(fs, path);
    expect(res?.kind).to.eql('png');
    expect(res?.width).to.eql(272);
    expect(res?.height).to.eql(226);
  });
});
