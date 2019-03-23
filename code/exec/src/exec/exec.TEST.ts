import { expect } from 'chai';
import { exec } from '.';

describe('exec', () => {
  describe('creating a [Command]', () => {
    it('exec.cmd.create', () => {
      const cmd = exec.cmd.create('run').add('--force');
      expect(cmd.toString()).to.eql('run --force');
    });

    it('exec.command', () => {
      const cmd = exec.command('run').add('--force');
      expect(cmd.toString()).to.eql('run --force');
    });
  });
});
