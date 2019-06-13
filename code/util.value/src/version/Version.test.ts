import { expect } from 'chai';
import { Version, version } from '.';

describe('Version', () => {
  it('has version value', () => {
    const res = version('0.1.2');
    expect(res.value).to.eql('0.1.2');
    expect(res.toString()).to.eql('0.1.2');
  });
});
