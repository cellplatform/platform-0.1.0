import { expect } from '@platform/test';
import { is } from '.';

describe('is', () => {
  it('is a directory', async () => {
    expect(await is.directory('src')).to.eql(true);
    expect(await is.dir('src')).to.eql(true);
  });

  it('is not directory', async () => {
    expect(await is.directory('src/index.ts')).to.eql(false);
    expect(await is.directory('')).to.eql(false);
    expect(await is.directory('/NO_EXIST')).to.eql(false);
  });

  it('is a file', async () => {
    expect(await is.file('src/index.ts')).to.eql(true);
  });

  it('is not file', async () => {
    expect(await is.file('src')).to.eql(false);
    expect(await is.file('')).to.eql(false);
    expect(await is.file('/NO_EXIST')).to.eql(false);
  });
});
