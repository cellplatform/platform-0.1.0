import { expect } from 'chai';
import { Version, version } from '.';

describe.only('Version', () => {
  it('has version value', () => {
    const res = version('0.1.2');
    expect(res.raw).to.eql('0.1.2');
    expect(res.toString()).to.eql('0.1.2');
  });

  it('retains raw version creation value (trimmed)', () => {
    const res = version(' =v0.1.2 ');
    expect(res.raw).to.eql('=v0.1.2');
    expect(res.toString()).to.eql('=v0.1.2');
  });

  // it.skip('cleans upon creation', () => {
  //   expect(version('   1.2.3  ').value).to.eql('1.2.3');
  //   expect(version('a.b.c').value).to.eql('a.b.c');
  // });

  // it('valid', () => {
  //   expect(version('1.2.3').isValid).to.eql(true);
  //   expect(version('  1.2.3  ').isValid).to.eql(true);
  //   expect(version('v1.2.3').isValid).to.eql(true);
  // });

  // it('invalid', () => {
  //   expect(version('a.b.c').isValid).to.eql(false);
  // });
});
