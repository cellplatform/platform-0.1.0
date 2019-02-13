import { fs } from '@platform/fs';
import { expect } from 'chai';

import { exec } from '.';

describe('exec.runCommands', () => {
  after(async () => fs.remove('tmp'));

  it('runs one command', async () => {
    const res = await exec.runCommands('mkdir -p tmp/foo', { silent: true });
    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(fs.existsSync('tmp/foo')).to.eql(true);
  });

  it('runs three commands', async () => {
    const res = await exec.runCommands(
      ['mkdir -p tmp/foo', 'mkdir -p tmp/bar', 'mkdir -p tmp/baz'],
      { silent: true },
    );
    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(fs.existsSync('tmp/foo')).to.eql(true);
    expect(fs.existsSync('tmp/bar')).to.eql(true);
    expect(fs.existsSync('tmp/baz')).to.eql(true);
  });
});
