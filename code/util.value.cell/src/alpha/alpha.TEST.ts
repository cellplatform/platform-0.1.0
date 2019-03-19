import { expect } from 'chai';
import { alpha } from '.';

describe('alpha.toCharacter', () => {
  it('converts 0 or negative number to [undefined]', () => {
    expect(alpha.toCharacter(-1)).to.eql(undefined);
    expect(alpha.toCharacter(-123)).to.eql(undefined);
  });

  it('converts 0 to A', () => {
    expect(alpha.toCharacter(0)).to.eql('A');
  });

  it('converts 1 to B', () => {
    expect(alpha.toCharacter(1)).to.eql('B');
  });

  it('converts 25 to Z', () => {
    expect(alpha.toCharacter(25)).to.eql('Z');
  });

  it('converts 26 to AA', () => {
    expect(alpha.toCharacter(26)).to.eql('AA');
  });

  it('converts 51 to ZZ', () => {
    expect(alpha.toCharacter(51)).to.eql('ZZ');
  });

  it('converts 52 to AAA', () => {
    expect(alpha.toCharacter(52)).to.eql('AAA');
  });

  it('converts 77 to ZZZ', () => {
    expect(alpha.toCharacter(77)).to.eql('ZZZ');
  });

  it('converts 78 to AAAA', () => {
    expect(alpha.toCharacter(78)).to.eql('AAAA');
  });
});

describe('alpha.fromCharacter', () => {
  it('converts undefined to -1', () => {
    expect(alpha.fromCharacter()).to.eql(undefined);
  });

  it('converts empty to undefined', () => {
    expect(alpha.fromCharacter('')).to.eql(undefined);
    expect(alpha.fromCharacter('  ')).to.eql(undefined);
  });

  it('converts (invalid char) to undefined', () => {
    expect(alpha.fromCharacter('&')).to.eql(undefined);
  });

  it('converts A to 0', () => {
    expect(alpha.fromCharacter('A')).to.eql(0);
  });

  it('converts B to 1', () => {
    expect(alpha.fromCharacter('B')).to.eql(1);
  });

  it('converts Z to 25', () => {
    expect(alpha.fromCharacter('Z')).to.eql(25);
  });

  it('converts AA to 26', () => {
    expect(alpha.fromCharacter('AA')).to.eql(26);
  });

  it('converts AB to 27', () => {
    expect(alpha.fromCharacter('AB')).to.eql(27);
  });

  it('converts ZZ to 51', () => {
    expect(alpha.fromCharacter('ZZ')).to.eql(51);
  });

  it('converts AAA to 52', () => {
    expect(alpha.fromCharacter('AAA')).to.eql(52);
  });

  it('converts ZZZ to 77', () => {
    expect(alpha.fromCharacter('ZZZ')).to.eql(77);
  });

  it('converts AAAA to 78', () => {
    expect(alpha.fromCharacter('AAAA')).to.eql(78);
  });

  it('converts AAAB to 79', () => {
    expect(alpha.fromCharacter('AAAB')).to.eql(79);
  });
});
