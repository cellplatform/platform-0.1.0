import { fs } from '@platform/fs';
import { expect } from 'chai';
import chalk from 'chalk';

import { exec } from '.';

describe('exec', () => {
  after(async () => fs.remove('tmp'));

  it('executes on a child process (single command)', async () => {
    await fs.remove('tmp/foo');
    const cmd = `mkdir -p tmp/foo`;
    const response = exec.cmd.run(cmd, { silent: true });
    const result = await response;

    expect(response.ok).to.eql(true);
    expect(response.code).to.eql(0);
    expect(response.error).to.eql(undefined);
    expect(response.info).to.eql([]);
    expect(response.errors).to.eql([]);

    expect(result.ok).to.eql(true);
    expect(result.code).to.eql(0);
    expect(result.error).to.eql(undefined);
    expect(result.info).to.eql([]);
    expect(result.errors).to.eql([]);

    expect(fs.existsSync('tmp/foo')).to.eql(true);
    await fs.remove('tmp/foo');
  });

  it('executes on a child process (two commands)', async () => {
    await fs.remove('tmp/foo');
    const cmd1 = `mkdir -p tmp/foo`;
    const cmd2 = `mkdir -p tmp/bar`;
    const res = await exec.cmd.run([cmd1, cmd2], { silent: true });

    expect(res.ok).to.eql(true);
    expect(res.code).to.eql(0);
    expect(res.error).to.eql(undefined);
    expect(res.info).to.eql([]);
    expect(res.errors).to.eql([]);
    expect(fs.existsSync('tmp/foo')).to.eql(true);
    expect(fs.existsSync('tmp/bar')).to.eql(true);

    await fs.remove('tmp/foo');
    await fs.remove('tmp/bar');
  });

  it('fails on a child process', async () => {
    const err = `Failed with code '127'`;
    const response = exec.cmd.run('FAIL_BIG_TIME', { silent: true });
    const result = await response;
    expect(response.ok).to.eql(false);
    expect(response.code).to.eql(127);
    expect(response.error && response.error.message).to.include(err);

    expect(result.ok).to.eql(false);
    expect(result.code).to.eql(127);
    expect(result.error && result.error.message).to.include(err);
  });

  it('prints to [stdout] with colors', async () => {
    // NB: Display only - no decent way to test.
    const colors = `${chalk.cyan('hey,')} ${chalk.magenta('with')} ${chalk.yellow('color! 🌼')}`;
    const cmd = `echo "${colors}"`;
    const res = await exec.cmd.run(cmd);
    expect(res.ok).to.eql(true);
  });

  it('isComplete flag', async () => {
    const res = exec.cmd.run('echo 123', { silent: true });
    expect(res.isComplete).to.eql(false);
    await res;
    expect(res.isComplete).to.eql(true);
  });

  it('emits [stdout] string with colors to [stdout$] observable', async () => {
    const cmd = `echo hello ${chalk.cyan('Selina')}`;
    const response = exec.cmd.run(cmd, { silent: true });

    const list: string[] = [];
    response.stdout$.subscribe(e => list.push(e));

    await response;
    expect(list.length).to.eql(1);
    expect(list[0]).to.include('hello \u001b');
  });

  it('emits from [stderr$] observable', async () => {
    const response = exec.cmd.run('FAIL_BIG_TIME', { silent: true });

    const list: string[] = [];
    response.stderr$.subscribe(e => list.push(e));

    await response;
    expect(list.length).to.eql(1);
    expect(list[0]).to.include('FAIL_BIG_TIME: command not found');
  });

  it('observables "complete"', async () => {
    const response = exec.cmd.run(['echo hello', 'FAIL_YO'], { silent: true });
    const complete = {
      output: false,
      stdout: false,
      stderr: false,
    };

    response.output$.subscribe({ complete: () => (complete.output = true) });
    response.stdout$.subscribe({ complete: () => (complete.stdout = true) });
    response.stderr$.subscribe({ complete: () => (complete.stderr = true) });

    await response;
    expect(complete.output).to.eql(true);
    expect(complete.stdout).to.eql(true);
    expect(complete.stderr).to.eql(true);
  });

  it('has [stdout] as [info] array with no colors', async () => {
    const cmd = `echo ${chalk.cyan('one')} \n echo two`;
    const response = exec.cmd.run(cmd, { silent: true });
    expect(response.info).to.eql([]);

    const result = await response;
    expect(response.info).to.eql(result.info);
    expect(result.info[0]).to.eql('one');
    expect(result.info[1]).to.eql('two');

    const { stdout, stderr } = response;
    expect(stderr).to.eql([]);
    expect(stdout.length).to.eql(2);
    expect(stdout[0]).to.include('\u001b[36mone\u001b[39m'); // Has colors.
    expect(stdout[1]).to.eql('two');
  });

  it('has stderr as [errors] array', async () => {
    const cmd = `echo ${chalk.cyan('one')} \n FAIL!!`;
    const response = exec.cmd.run(cmd, { silent: true });
    expect(response.errors).to.eql([]);

    const result = await response;
    expect(response.errors).to.eql(result.errors);
    expect(result.errors[0]).to.include('FAIL!!: command not found');

    const { stderr } = response;
    expect(stderr[0]).to.include('FAIL!!: command not found');
  });
});
