import { Test, expect } from '../test';
import { Filesize } from '.';
import { Filesystem } from '..';

export default Test.describe('Filesize', (e) => {
  e.it('default', () => {
    expect(Filesize(1000)).to.eql('1 kB');
  });

  e.it('round', () => {
    expect(Filesize(1234)).to.eql('1.23 kB');
    expect(Filesize(1234, { round: 1 })).to.eql('1.2 kB');
    expect(Filesize(1234, { round: 0 })).to.eql('1 kB');
  });

  e.it('spacer', () => {
    expect(Filesize(1234, { spacer: '' })).to.eql('1.23kB');
    expect(Filesize(1234, { spacer: ':' })).to.eql('1.23:kB');
  });

  e.it('Filesystem.Filesize(...)', () => {
    expect(Filesystem.Filesize(1234)).to.eql('1.23 kB');
  });
});
