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
});
