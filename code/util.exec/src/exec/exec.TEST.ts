import { expect } from 'chai';
import { exec } from '.';

describe('exec', () => {
  it('creates a command', () => {
    const cmd = exec.cmd.create('run').add('--force');
    expect(cmd.toString()).to.eql('run --force');
  });
});
