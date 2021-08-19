import { ManifestFile } from '.';
import { expect, TestUtil } from '../test';

const fs = TestUtil.node;

describe('ManifestFile', () => {
  beforeEach(() => TestUtil.reset());

  describe('parse', () => {
    const baseDir = fs.resolve('static.test');

    it('image file (png)', async () => {
      const path = fs.join(baseDir, 'images/bird.png');
      const res = await ManifestFile.parse({ fs, baseDir, path });

      expect(res.path).to.eql('images/bird.png');
      expect(res.bytes).to.eql(71342);
      expect(res.filehash).to.eql(
        'sha256-86ad939983ad653222630eecf8a274462a9ba55b0d531a2621b69c5726a4f9d8',
      );
      expect(res.image?.kind).to.eql('png');
      expect(res.image?.width).to.eql(272);
      expect(res.image?.height).to.eql(226);
    });

    it('text file', async () => {
      const path = fs.join(baseDir, 'file.txt');
      const res = await ManifestFile.parse({ fs, baseDir, path });

      expect(res.path).to.eql('file.txt');
      expect(res.bytes).to.eql(7);
      expect(res.filehash).to.eql(
        'sha256-aec070645fe53ee3b3763059376134f058cc337247c978add178b6ccdfb0019f',
      );
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
      expect(res.filehash).to.eql(
        'sha256-aec070645fe53ee3b3763059376134f058cc337247c978add178b6ccdfb0019f',
      );
      expect(res.image).to.eql(undefined);
    });
  });
});
