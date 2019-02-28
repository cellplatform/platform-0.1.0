import { fs } from '@platform/fs';
import { expect } from 'chai';
import { Command } from '.';

describe('Command', () => {
  after(async () => fs.remove('tmp'));

  it('creates with no parts', () => {
    const cmd = Command.create();
    expect(cmd.parts).to.eql([]);
  });

  it('creates with an initial part', () => {
    const cmd = Command.create('  run   ');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
  });

  it('adds a command (trimmed)', () => {
    const cmd = Command.create().add('  run  ');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
  });

  it('adds a command (multi value)', () => {
    const cmd = Command.create().add('  run foo ');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run foo');
    expect(cmd.parts[0].type).to.eql('COMMAND');
  });

  it('adds two commands', () => {
    const cmd = Command.create()
      .add('  run  ')
      .add('now');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('now');
    expect(cmd.parts[1].type).to.eql('COMMAND');
  });

  it('adds flag (--force)', () => {
    const cmd = Command.create()
      .add('run')
      .add(' --force   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--force');
    expect(cmd.parts[1].type).to.eql('FLAG');
  });

  it('adds flag (-f)', () => {
    const cmd = Command.create()
      .add('run')
      .add(' -f   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('-f');
    expect(cmd.parts[1].type).to.eql('FLAG');
  });

  it('adds argument (--dir=foo)', () => {
    const cmd = Command.create()
      .add('run')
      .add('  --dir=foo   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir=foo');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('adds argument (--dir foo)', () => {
    const cmd = Command.create()
      .add('run')
      .add('  --dir foo   ');
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir foo');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('conditional adding', () => {
    const cmd = Command.create()
      .add('run')
      .add('--force', false)
      .add('--dir 1234', true);
    expect(cmd.parts.length).to.eql(2);
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[0].type).to.eql('COMMAND');
    expect(cmd.parts[1].value).to.eql('--dir 1234');
    expect(cmd.parts[1].type).to.eql('ARG');
  });

  it('trims new-line from added values', () => {
    const cmd = Command.create()
      .add('\n  run \n\n')
      .add('  --force \n  \n')
      .add('   \n\n \n--dir \n1234');
    expect(cmd.parts[0].value).to.eql('run');
    expect(cmd.parts[1].value).to.eql('--force');
    expect(cmd.parts[2].value).to.eql('--dir 1234');
  });

  it('does not add a new-line if the command is empty', () => {
    const cmd = Command.create()
      .newLine()
      .add('run');
    expect(cmd.parts.length).to.eql(1);
    expect(cmd.parts[0].value).to.eql('run');
  });

  it('adds a new-line', () => {
    const cmd = Command.create()
      .newLine()
      .add('run')
      .newLine()
      .add('delete');
    expect(cmd.parts[0].value).to.eql('run\n');
    expect(cmd.parts[1].value).to.eql('delete');
  });

  it('adds a command in the [newLine] method', () => {
    const cmd = Command.create('run').newLine('build fast');
    expect(cmd.parts[0].value).to.eql('run\n');
    expect(cmd.parts[1].value).to.eql('build fast');
  });

  it('adds a command in the [newLine] method (conditiona)', () => {
    const cmd = Command.create('run')
      .newLine('build fast')
      .newLine('foo', false)
      .newLine('yo');
    expect(cmd.parts[0].value).to.eql('run\n');
    expect(cmd.parts[1].value).to.eql('build fast\n');
    expect(cmd.parts[2].value).to.eql('yo');
  });

  it('toString (empty)', () => {
    const cmd = Command.create();
    expect(cmd.toString()).to.eql('');
  });

  it('toString (single command)', () => {
    const cmd = Command.create().add('  build  ');
    expect(cmd.toString()).to.eql('build');
  });

  it('toString (command, arg, flag)', () => {
    const cmd = Command.create()
      .add('  build  ')
      .add('--force')
      .add('--dir=123');
    expect(cmd.toString()).to.eql('build --force --dir=123');
  });

  it('runs a command', async () => {
    const cmd = Command.create()
      .add('mkdir')
      .add('-p tmp/foo');

    const response = cmd.run({ silent: true });
    const result = await response;
    expect(result.ok).to.eql(true);
    expect(result.code).to.eql(0);

    expect(fs.existsSync('tmp/foo')).to.eql(true);
    await fs.remove('tmp/foo');
  });

  it('clones', () => {
    const cmd1 = Command.create('run').add('--force');
    const cmd2 = cmd1.clone();
    expect(cmd1.toString()).to.eql('run --force');
    expect(cmd1).to.not.equal(cmd2);
    expect(cmd1.toString()).to.eql(cmd2.toString());
    expect(cmd1.parts).to.eql(cmd2.parts);
  });
});
