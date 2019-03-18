import { expect } from 'chai';
import { toAlphaCharacter, fromAlphaCharacter } from './toAlpha';

describe('toAlphaCharacter', () => {
  it('converts 0 or negative number to [undefined]', () => {
    expect(toAlphaCharacter(-1)).to.eql(undefined);
    expect(toAlphaCharacter(-123)).to.eql(undefined);
  });

  it('converts 0 to A', () => {
    expect(toAlphaCharacter(0)).to.eql('A');
  });

  it('converts 1 to B', () => {
    expect(toAlphaCharacter(1)).to.eql('B');
  });

  it('converts 25 to Z', () => {
    expect(toAlphaCharacter(25)).to.eql('Z');
  });

  it('converts 26 to AA', () => {
    expect(toAlphaCharacter(26)).to.eql('AA');
  });

  it('converts 51 to ZZ', () => {
    expect(toAlphaCharacter(51)).to.eql('ZZ');
  });

  it('converts 52 to AAA', () => {
    expect(toAlphaCharacter(52)).to.eql('AAA');
  });

  it('converts 77 to ZZZ', () => {
    expect(toAlphaCharacter(77)).to.eql('ZZZ');
  });

  it('converts 78 to AAAA', () => {
    expect(toAlphaCharacter(78)).to.eql('AAAA');
  });
});

describe('fromAlphaCharacter', () => {
  it('converts undefined to -1', () => {
    expect(fromAlphaCharacter()).to.eql(undefined);
  });

  it('converts empty to undefined', () => {
    expect(fromAlphaCharacter('')).to.eql(undefined);
    expect(fromAlphaCharacter('  ')).to.eql(undefined);
  });

  it('converts (invalid char) to undefined', () => {
    expect(fromAlphaCharacter('&')).to.eql(undefined);
  });

  it('converts A to 0', () => {
    expect(fromAlphaCharacter('A')).to.eql(0);
  });

  it('converts B to 1', () => {
    expect(fromAlphaCharacter('B')).to.eql(1);
  });

  it('converts Z to 25', () => {
    expect(fromAlphaCharacter('Z')).to.eql(25);
  });

  it('converts AA to 26', () => {
    expect(fromAlphaCharacter('AA')).to.eql(26);
  });

  it('converts AB to 27', () => {
    expect(fromAlphaCharacter('AB')).to.eql(27);
  });

  it('converts ZZ to 51', () => {
    expect(fromAlphaCharacter('ZZ')).to.eql(51);
  });

  it('converts AAA to 52', () => {
    expect(fromAlphaCharacter('AAA')).to.eql(52);
  });

  it('converts ZZZ to 77', () => {
    expect(fromAlphaCharacter('ZZZ')).to.eql(77);
  });

  it('converts AAAA to 78', () => {
    expect(fromAlphaCharacter('AAAA')).to.eql(78);
  });

  it('converts AAAB to 79', () => {
    expect(fromAlphaCharacter('AAAB')).to.eql(79);
  });
});
