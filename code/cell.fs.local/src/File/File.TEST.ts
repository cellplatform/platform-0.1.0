import { File } from '.';
import { expect, TestUtil } from '../test';

const fs = TestUtil.node;

describe('File', () => {
  describe('manifestFile', () => {
    it('image (png)', async () => {
      const baseDir = fs.resolve('static.test');
      const path = fs.join(baseDir, 'images/bird.png');
      const res = await File.manifestFile({ fs, baseDir, path });

      expect(res.path).to.eql('images/bird.png');
      expect(res.bytes).to.eql(71342);
      expect(res.filehash).to.eql(
        'sha256-86ad939983ad653222630eecf8a274462a9ba55b0d531a2621b69c5726a4f9d8',
      );
      expect(res.image?.kind).to.eql('png');
      expect(res.image?.width).to.eql(272);
      expect(res.image?.height).to.eql(226);
    });

    it('image (txt)', async () => {
      const baseDir = fs.resolve('static.test');
      const path = fs.join(baseDir, 'file.txt');
      const res = await File.manifestFile({ fs, baseDir, path });

      expect(res.path).to.eql('file.txt');
      expect(res.bytes).to.eql(7);
      expect(res.filehash).to.eql(
        'sha256-aec070645fe53ee3b3763059376134f058cc337247c978add178b6ccdfb0019f',
      );
      expect(res.image).to.eql(undefined);
    });
  });
});
