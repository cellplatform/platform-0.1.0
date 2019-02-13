import { fs } from '@platform/fs';
import { expect } from 'chai';

import { exec } from '.';

describe('exec', () => {
  after(async () => fs.remove('tmp'));

  it('executes on a child process', async () => {
    await fs.remove('tmp/foo');
    const cmd = `mkdir -p tmp/foo`;
    const res = await exec.run(cmd);

    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(res.info).to.eql([]);
    expect(res.errors).to.eql([]);
    expect(fs.existsSync('tmp/foo')).to.eql(true);

    await fs.remove('tmp/foo');
  });

  it('fails on a child process', async () => {
    const res = await exec.run('FAIL_BIG_TIME', { silent: true });
    expect(res.ok).to.eql(false);
    expect(res.code).to.eql(127);
  });

  it('has no [stdout] when not silent', async () => {
    const cmd = `echo foo \n echo bar`;
    const res = await exec.run(cmd);
    expect(res.info).to.eql([]);
    expect(res.errors).to.eql([]);
  });

  it('has [stdout] when silent', async () => {
    const cmd = `echo one && echo two`;
    const res = await exec.run(cmd, { silent: true });
    expect(res.info).to.eql(['one', 'two']);
    expect(res.ok).to.eql(true);
  });

  it('has [stderr]', async () => {
    const cmd = `@#$ \n 38^88`;
    const res = await exec.run(cmd, { silent: true });

    expect(res.ok).to.eql(false);
    expect(res.errors.length).to.eql(2);
    expect(res.errors[0]).to.include('command not found');
    expect(res.errors[1]).to.include('command not found');

    expect(res.error && res.error.message).to.include(
      `Errors occured in 'stderr'`,
    );
    expect(res.error && res.error.message).to.include(`errors[2] list`);
  });
});
