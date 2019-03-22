import { fs } from '@platform/fs';
import { expect } from 'chai';
import { exec } from '.';

describe('exec.cmd.runList', () => {
  after(async () => fs.remove('tmp'));

  it('runs one command', async () => {
    const cmd = 'mkdir -p tmp/foo';
    const res = await exec.cmd.runList(cmd, { silent: true });

    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(res.errors).to.eql([]);
    expect(res.dir).to.eql(process.cwd());

    expect(res.results.length).to.eql(1);
    expect(res.results[0].cmd).to.eql(cmd);
    expect(res.results[0].ok).to.eql(true);
    expect(res.results[0].data.code).to.eql(0);
    expect(res.results[0].data.ok).to.eql(true);

    expect(fs.existsSync('tmp/foo')).to.eql(true);
  });

  it('runs three commands', async () => {
    const cmds = ['mkdir -p tmp/foo', 'mkdir -p tmp/bar', 'mkdir -p tmp/baz'];
    const res = await exec.cmd.runList(cmds, { silent: true });

    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);

    expect(res.results.length).to.eql(3);
    expect(res.results[0].cmd).to.eql(cmds[0]);
    expect(res.results[1].cmd).to.eql(cmds[1]);
    expect(res.results[2].cmd).to.eql(cmds[2]);

    expect(fs.existsSync('tmp/foo')).to.eql(true);
    expect(fs.existsSync('tmp/bar')).to.eql(true);
    expect(fs.existsSync('tmp/baz')).to.eql(true);
  });

  it('runs command with error', async () => {
    const res = await exec.cmd.runList(['echo foo', 'FAIL!'], { silent: true });

    expect(res.ok).to.eql(false);
    expect(res.code).to.eql(1);
    expect(res.error && res.error.message).to.include(
      'Error while executing commands (1 of 2 failed)',
    );

    expect(res.errors.length).to.eql(1);
    expect(res.errors[0].index).to.eql(1);
    expect(res.errors[0].cmd).to.eql('FAIL!');
    expect(res.errors[0].errors[0]).to.include('FAIL!: command not found');

    const results = res.results;
    expect(results.length).to.eql(2);
    expect(results[0].ok).to.eql(true);
    expect(results[1].ok).to.eql(false);

    const result = results[1];
    expect(result && result.data.errors[0]).to.include('FAIL!: command not found');
    expect((result as any).data.error.message).to.include('Failed with code 127');
  });
});
