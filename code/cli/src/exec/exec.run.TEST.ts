import { expect } from 'chai';

import { exec } from '.';
import { fs } from '../common';

describe('exec', () => {
  after(async () => fs.remove('tmp'));

  it('executes on a child process', async () => {
    await fs.remove('tmp/foo');
    const cmd = `mkdir -p tmp/foo`;
    const res = await exec.run(cmd);

    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(fs.existsSync('tmp/foo')).to.eql(true);

    await fs.remove('tmp/foo');
  });

  it('fails on a child process', async () => {
    const res = await exec.run('FAIL_BIG_TIME', { silent: true });
    expect(res.ok).to.eql(false);
    expect(res.code).to.eql(127);
  });
});
