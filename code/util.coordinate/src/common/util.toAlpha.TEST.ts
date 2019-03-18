import { expect } from 'chai';
import * as util from './util';

describe('toAlphaCharacter', () => {
  it('converts 0 or negative number to [undefined]', () => {
    expect(util.toAlphaCharacter(-1)).to.eql(undefined);
    expect(util.toAlphaCharacter(-123)).to.eql(undefined);
  });

  it('converts 0 to A', () => {
    expect(util.toAlphaCharacter(0)).to.eql('A');
  });

  it('converts 1 to B', () => {
    expect(util.toAlphaCharacter(1)).to.eql('B');
  });

  it('converts 25 to Z', () => {
    expect(util.toAlphaCharacter(25)).to.eql('Z');
  });

  it('converts 26 to AA', () => {
    expect(util.toAlphaCharacter(26)).to.eql('AA');
  });

  it('converts 51 to ZZ', () => {
    expect(util.toAlphaCharacter(51)).to.eql('ZZ');
  });

  it('converts 52 to AAA', () => {
    expect(util.toAlphaCharacter(52)).to.eql('AAA');
  });

  it('converts 77 to ZZZ', () => {
    expect(util.toAlphaCharacter(77)).to.eql('ZZZ');
  });

  it('converts 78 to AAAA', () => {
    expect(util.toAlphaCharacter(78)).to.eql('AAAA');
  });
});

describe('fromAlphaCharacter', () => {
  it('converts undefined to -1', () => {
    expect(util.fromAlphaCharacter()).to.eql(undefined);
  });

  it('converts empty to undefined', () => {
    expect(util.fromAlphaCharacter('')).to.eql(undefined);
    expect(util.fromAlphaCharacter('  ')).to.eql(undefined);
  });

  it('converts (invalid char) to undefined', () => {
    expect(util.fromAlphaCharacter('&')).to.eql(undefined);
  });

  it('converts A to 0', () => {
    expect(util.fromAlphaCharacter('A')).to.eql(0);
  });

  it('converts B to 1', () => {
    expect(util.fromAlphaCharacter('B')).to.eql(1);
  });

  it('converts Z to 25', () => {
    expect(util.fromAlphaCharacter('Z')).to.eql(25);
  });

  it('converts AA to 26', () => {
    expect(util.fromAlphaCharacter('AA')).to.eql(26);
  });

  it('converts AB to 27', () => {
    expect(util.fromAlphaCharacter('AB')).to.eql(27);
  });

  it('converts ZZ to 51', () => {
    expect(util.fromAlphaCharacter('ZZ')).to.eql(51);
  });

  it('converts AAA to 52', () => {
    expect(util.fromAlphaCharacter('AAA')).to.eql(52);
  });

  it('converts ZZZ to 77', () => {
    expect(util.fromAlphaCharacter('ZZZ')).to.eql(77);
  });

  it('converts AAAA to 78', () => {
    expect(util.fromAlphaCharacter('AAAA')).to.eql(78);
  });

  it('converts AAAB to 79', () => {
    expect(util.fromAlphaCharacter('AAAB')).to.eql(79);
  });
});
