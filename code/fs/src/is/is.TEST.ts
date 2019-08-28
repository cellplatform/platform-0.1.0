import { expect } from '@platform/test';
import { is } from '.';

describe('is', () => {
  it('is a directory', async () => {
    expect(await is.dir('src')).to.eql(true);
    expect(is.dirSync('src')).to.eql(true);
  });

  it('is not directory', async () => {
    expect(await is.dir('src/index.ts')).to.eql(false);
    expect(await is.dir('')).to.eql(false);
    expect(await is.dir('/NO_EXIST')).to.eql(false);

    expect(is.dirSync('src/index.ts')).to.eql(false);
    expect(is.dirSync('')).to.eql(false);
    expect(is.dirSync('/NO_EXIST')).to.eql(false);
  });

  it('is a file', async () => {
    expect(await is.file('src/index.ts')).to.eql(true);
    expect(is.fileSync('src/index.ts')).to.eql(true);
  });

  it('is not file', async () => {
    expect(await is.file('src')).to.eql(false);
    expect(await is.file('')).to.eql(false);
    expect(await is.file('/NO_EXIST')).to.eql(false);

    expect(is.fileSync('src')).to.eql(false);
    expect(is.fileSync('')).to.eql(false);
    expect(is.fileSync('/NO_EXIST')).to.eql(false);
  });

  it('is type', async () => {
    expect(await is.type('src')).to.eql(true);
    expect(await is.type('src', 'DIR')).to.eql(true);
    expect(await is.type('src', 'FILE')).to.eql(false);

    expect(await is.type('src/index.ts')).to.eql(true);
    expect(await is.type('src/index.ts', 'FILE')).to.eql(true);
    expect(await is.type('src/index.ts', 'DIR')).to.eql(false);

    expect(is.typeSync('src')).to.eql(true);
    expect(is.typeSync('src', 'DIR')).to.eql(true);
    expect(is.typeSync('src', 'FILE')).to.eql(false);

    expect(is.typeSync('src/index.ts')).to.eql(true);
    expect(is.typeSync('src/index.ts', 'FILE')).to.eql(true);
    expect(is.typeSync('src/index.ts', 'DIR')).to.eql(false);
  });
});
