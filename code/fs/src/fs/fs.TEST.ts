import { expect } from 'chai';
import { fs } from '.';

describe('fs', () => {
  it('reads file', async () => {
    const path = fs.resolve('./test/sample/my-file.md');
    const txt = await fs.readFile(path, 'utf8');
    expect(txt).to.include('# Hello');
  });

  it('has path helpers', () => {
    expect(fs.path.join).to.be.an.instanceof(Function);
    expect(fs.join).to.be.an.instanceof(Function);
    expect(fs.resolve).to.be.an.instanceof(Function);
    expect(fs.dirname).to.be.an.instanceof(Function);
    expect(fs.basename).to.be.an.instanceof(Function);
    expect(fs.extname).to.be.an.instanceof(Function);
  });

  it('has glob helper', () => {
    expect(fs.glob.find).to.be.an.instanceof(Function);
  });

  describe('folderSize', () => {
    it('calculates the size of a directory', async () => {
      const res = await fs.folderSize('./src');
      expect(res.files.length).to.greaterThan(5);
      expect(res.bytes).to.greaterThan(1000);
    });

    it('nothing when path does not exist', async () => {
      const res = await fs.folderSize('./NO_EXIST');
      expect(res.bytes).to.eql(0);
      expect(res.files).to.eql([]);
    });
  });
});
