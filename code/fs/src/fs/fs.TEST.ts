import { expect } from 'chai';
import { fs } from '.';

describe('size', () => {
  it('match', () => {
    const match = fs.match('**/*.js');
    expect(match.path('foo.js')).to.eql(true);
    expect(match.base('foo.txt')).to.eql(false);
  });

  describe('file', () => {
    it('calculates the size of single file', async () => {
      const path = './src/fs/fs.TEST.ts';
      const res = await fs.size.file(path);
      expect(res.bytes).to.greaterThan(30);
      expect(res.path).to.eql(path);
    });

    it('toString', async () => {
      const res = await fs.size.file('./test/file/foo.json');
      expect(res.toString()).to.eql('20 B');
      expect(res.toString({ spacer: '' })).to.eql('20B');
    });
  });

  describe('dir', () => {
    it('calculates the size of a directory', async () => {
      const res = await fs.size.dir('./src');
      expect(res.files.length).to.greaterThan(5);
      expect(res.bytes).to.greaterThan(1000);
      expect(res.path).to.eql('./src');
    });

    it('toString', async () => {
      const res = await fs.size.dir('./test/file');
      expect(res.toString()).to.eql('826 B');
    });

    it('nothing when path does not exist', async () => {
      const res = await fs.size.dir('./NO_EXIST');
      expect(res.bytes).to.eql(0);
      expect(res.files).to.eql([]);
    });
  });

  describe('size.toString( bytes )', () => {
    it('converts to human readable size', () => {
      expect(fs.size.toString(123)).to.eql('123 B');
      expect(fs.size.toString(9999)).to.eql('9.76 KB');
      expect(fs.size.toString(9999, { spacer: '' })).to.eql('9.76KB');
      expect(fs.size.toString(9999, { round: 1 })).to.eql('9.8 KB');
      expect(fs.size.toString(9999, { round: 0 })).to.eql('10 KB');
    });
  });
});
