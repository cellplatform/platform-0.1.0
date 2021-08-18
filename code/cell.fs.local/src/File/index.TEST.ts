import { expect, expectError, util, Hash, t } from '../test';
import { File } from '.';
import { FsIndexer } from '..';

const fs = util.node;

describe('File', () => {
  describe('toManifestFile', () => {
    it('image (png)', async () => {
      const baseDir = fs.resolve('static.test');
      const path = fs.join(baseDir, 'images/bird.png');
      const res = await File.toManifestFile({ fs, baseDir, path });

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
      const res = await File.toManifestFile({ fs, baseDir, path });

      expect(res.path).to.eql('file.txt');
      expect(res.bytes).to.eql(7);
      expect(res.filehash).to.eql(
        'sha256-aec070645fe53ee3b3763059376134f058cc337247c978add178b6ccdfb0019f',
      );
      expect(res.image).to.eql(undefined);
    });
  });

  describe('hash', () => {
    it('hash.files - [array]', () => {
      const file1: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'abc' };
      const file2: t.ManifestFile = { path: 'foo.txt', bytes: 1234, filehash: 'def' };
      const hash = Hash.sha256([file1.filehash, file2.filehash]);
      expect(File.Hash.files([file1, file2, undefined] as any)).to.eql(hash);
    });

    it('hash.files - {manifest}', async () => {
      const dir = fs.resolve('static.test');
      const indexer = FsIndexer({ fs, dir });
      const manifest = await indexer.manifest();
      const hash = Hash.sha256(manifest.files.map((file) => file.filehash));
      expect(manifest.hash.files).to.eql(hash);
      expect(File.Hash.files(manifest)).to.eql(hash);
    });

    it('hash.filehash', async () => {
      const dir = fs.resolve('static.test');
      const indexer = FsIndexer({ fs, dir });
      const manifest = await indexer.manifest();

      const filename = 'images/award.svg';
      const file = manifest.files.find((file) => file.path === filename);
      const hash = await File.Hash.filehash(fs, fs.join(dir, filename));

      expect(hash).to.match(/^sha256-/);
      expect(hash).to.eql(file?.filehash);
    });
  });

  describe('sizeOfImage', () => {
    it('calculates size', async () => {
      const test = async (path: string, width: number, height: number) => {
        const res = await File.sizeOfImage(path);
        expect(res?.width).to.eql(width);
        expect(res?.height).to.eql(height);
      };

      await test('static.test/images/hand.jpg', 81, 81);
      await test('static.test/favicon.ico', 16, 16);
      await test('static.test/images/bird.png', 272, 226);
      await test('static.test/images/award.svg', 24, 24);
    });

    it('throw: file does not exist', async () => {
      await expectError(() => File.sizeOfImage('does/not/exist'), `no such file or directory`);
    });

    it('throw: file type not supported', async () => {
      await expectError(() => File.sizeOfImage('static.test/file.txt'), `unsupported file type`);
    });
  });

  describe('toImage', () => {
    it('toImage', async () => {
      const path = fs.resolve('static.test/images/bird.png');
      const res = await File.toImage(fs, path);
      expect(res?.kind).to.eql('png');
      expect(res?.width).to.eql(272);
      expect(res?.height).to.eql(226);
    });
  });
});
