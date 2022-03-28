import { Test, expect } from 'sys.ui.dev';
import { Semver } from '.';

export default Test.describe('Semver', (e) => {
  e.describe('FC decorations', (e) => {
    e.it('Semver.default', () => {
      expect(Semver.default).to.eql('0.0.0');
    });

    e.it('Semver.CONSTANTS', () => {
      expect(Semver.constants.default).to.eql('0.0.0');
      expect(Semver.constants.releaseTypes.includes('patch')).to.eql(true);
    });
  });
});
