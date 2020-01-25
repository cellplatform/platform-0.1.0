import { expect } from 'chai';
import { fs } from '..';

describe('size', () => {
  it('bytes (from path)', async () => {
    const path = fs.resolve('test/size/0.png');
    const res = await fs.size.file(path);
    expect(res.bytes).to.eql(1465);
    expect(res.toString()).to.eql('1.43 KB');
  });

  it('toString (from bytes)', async () => {
    expect(fs.size.toString(1465)).to.eql('1.43 KB');
  });

  it('toString (from buffer)', async () => {
    const path = fs.resolve('test/size/0.png');
    const buffer = await fs.readFile(path);
    expect(fs.size.toString(buffer)).to.eql('1.43 KB');
  });
});
