import { expect } from 'chai';
import { alpha } from '.';

describe('alpha.toCharacter', () => {
  it('converts negative number to empty string (undefined)', () => {
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

  it('converts 27 to AA', () => {
    expect(alpha.toCharacter(27)).to.eql('AB');
  });

  it('converts 51 to AZ', () => {
    expect(alpha.toCharacter(51)).to.eql('AZ');
  });

  it('converts 52 to BA', () => {
    expect(alpha.toCharacter(52)).to.eql('BA');
  });

  it('converts 77 to BZ', () => {
    expect(alpha.toCharacter(77)).to.eql('BZ');
  });

  it('converts 78 to CA', () => {
    expect(alpha.toCharacter(78)).to.eql('CA');
  });
});

describe('alpha.fromCharacter', () => {
  it('undefined', () => {
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
    expect(alpha.fromCharacter('a')).to.eql(0);
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

  it('converts AZ to 51', () => {
    expect(alpha.fromCharacter('AZ')).to.eql(51);
  });

  it('converts ZZ to 701', () => {
    expect(alpha.fromCharacter('ZZ')).to.eql(701);
  });
});
