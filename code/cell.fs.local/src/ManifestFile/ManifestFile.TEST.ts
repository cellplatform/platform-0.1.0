import { ManifestFile } from '.';
import { expect, TestUtil } from '../test';

const fs = TestUtil.node;

describe('ManifestFile', () => {
  beforeEach(() => TestUtil.reset());

  const expectHash = (hash: string, end: string) => {
    expect(hash).to.match(/^sha256-/);
    expect(hash.endsWith(end)).to.eql(true, `source: ${hash}`);
  };

  describe('parse', () => {
    const baseDir = fs.resolve('static.test');

    it('image file (png)', async () => {
      const path = fs.join(baseDir, 'images/bird.png');
      const res = await ManifestFile.parse({ fs, baseDir, path });

      expect(res.path).to.eql('images/bird.png');
      expect(res.bytes).to.eql(71342);
      expectHash(res.filehash, '4debc04d75b227ac');
      expect(res.image?.kind).to.eql('png');
      expect(res.image?.width).to.eql(272);
      expect(res.image?.height).to.eql(226);
    });

    it('text file', async () => {
      const path = fs.join(baseDir, 'file.txt');
      const res = await ManifestFile.parse({ fs, baseDir, path });

      expect(res.path).to.eql('file.txt');
      expect(res.bytes).to.eql(7);
      expectHash(res.filehash, '4bb69d7c765d045bc1');
      expect(res.image).to.eql(undefined);
    });

    it('non-image file saved with image extension (png)', async () => {
      const file = await fs.readFile(fs.resolve('static.test/file.txt'));
      const baseDir = fs.resolve('tmp/fake');
      const path = fs.join(baseDir, 'foo.png');
      await TestUtil.writeFile(path, file);

      const res = await ManifestFile.parse({ fs, baseDir, path });

      expect(res.path).to.eql('foo.png');
      expect(res.bytes).to.eql(7);
      expectHash(res.filehash, '69d7c765d045bc1');
      expect(res.image).to.eql(undefined);
    });
  });
});
