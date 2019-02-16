import { fs } from '@platform/fs';
import { expect } from 'chai';
import { exec } from '.';

describe('exec.process', () => {
  after(async () => fs.remove('tmp'));

  it('spawn (child process)', async () => {
    await fs.remove('tmp/foo');
    const cmd = `mkdir -p tmp/foo`;
    const response = exec.process.spawn(cmd);

    expect(typeof response.child.pid).to.eql('number');
    expect(typeof response.complete.then).to.eql('function');

    const result = await response.complete;

    expect(result.ok).to.eql(true);
    expect(result.code).to.eql(0);
    expect(result.error).to.eql(undefined);

    expect(fs.existsSync('tmp/foo')).to.eql(true);
    await fs.remove('tmp/foo');
  });
});
